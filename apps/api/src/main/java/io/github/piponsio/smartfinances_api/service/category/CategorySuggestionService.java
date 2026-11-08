package io.github.piponsio.smartfinances_api.service.category;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import io.github.piponsio.smartfinances_api.dto.response.CategorySuggestionDto;
import io.github.piponsio.smartfinances_api.entity.Category;
import io.github.piponsio.smartfinances_api.entity.Transaction;
import io.github.piponsio.smartfinances_api.enums.TransactionType;
import io.github.piponsio.smartfinances_api.repository.CategoryRepository;
import io.github.piponsio.smartfinances_api.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;

/**
 * Suggests the most likely category for a transaction based on its description.
 *
 * <p>Strategy, in order of preference:
 * <ol>
 *   <li>Learn from the user's own history: score each past category by how many
 *       description keywords it shares with the new description.</li>
 *   <li>Fall back to a small built-in keyword dictionary mapped onto the user's
 *       default categories (Food &amp; Dining, Transportation, ...).</li>
 * </ol>
 * Returns a suggestion with a {@code null} categoryId and {@code 0} confidence
 * when nothing matches, so callers can safely leave the field for the user.
 */
@Service
@RequiredArgsConstructor
public class CategorySuggestionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    // Very common words that carry no categorization signal.
    private static final Set<String> STOP_WORDS = Set.of(
            "the", "and", "for", "from", "with", "payment", "purchase", "pos", "card",
            "transaction", "debit", "credit", "www", "com", "inc", "llc", "usd");

    // Built-in fallbacks: keyword -> default category name (as seeded on register).
    private static final Map<String, String> KEYWORD_TO_DEFAULT = buildDefaultKeywordMap();

    public CategorySuggestionDto suggest(Long userId, String description, TransactionType type) {
        Set<String> queryTokens = tokenize(description);
        if (queryTokens.isEmpty()) {
            return empty();
        }

        List<Transaction> history = transactionRepository.findByUserId(userId);

        // Accumulate a keyword-overlap score per category, restricted to the given type.
        Map<Long, Double> scoreByCategory = new HashMap<>();
        Map<Long, String> nameByCategory = new HashMap<>();
        double totalScore = 0.0;

        for (Transaction tx : history) {
            Category category = tx.getCategory();
            if (category == null || category.getType() != type) {
                continue;
            }
            Set<String> txTokens = tokenize(tx.getDescription());
            long overlap = txTokens.stream().filter(queryTokens::contains).count();
            if (overlap == 0) {
                continue;
            }
            double score = (double) overlap / queryTokens.size();
            scoreByCategory.merge(category.getId(), score, Double::sum);
            nameByCategory.putIfAbsent(category.getId(), category.getName());
            totalScore += score;
        }

        if (!scoreByCategory.isEmpty()) {
            Map.Entry<Long, Double> best = scoreByCategory.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .orElseThrow();
            // Confidence = how dominant the winner is relative to all matches.
            double confidence = best.getValue() / totalScore;
            return new CategorySuggestionDto(best.getKey(), nameByCategory.get(best.getKey()), round(confidence));
        }

        return suggestFromDefaults(userId, queryTokens, type);
    }

    private CategorySuggestionDto suggestFromDefaults(Long userId, Set<String> queryTokens, TransactionType type) {
        for (String token : queryTokens) {
            String defaultName = KEYWORD_TO_DEFAULT.get(token);
            if (defaultName == null) {
                continue;
            }
            Category match = categoryRepository.findAllByUserId(userId).stream()
                    .filter(c -> c.getType() == type && c.getName().equalsIgnoreCase(defaultName))
                    .findFirst()
                    .orElse(null);
            if (match != null) {
                // Dictionary matches are a weaker signal than learned history.
                return new CategorySuggestionDto(match.getId(), match.getName(), 0.5);
            }
        }
        return empty();
    }

    private Set<String> tokenize(String text) {
        if (text == null || text.isBlank()) {
            return Set.of();
        }
        Set<String> tokens = new HashSet<>();
        for (String raw : text.toLowerCase().split("[^a-z0-9]+")) {
            if (raw.length() >= 3 && !STOP_WORDS.contains(raw)) {
                tokens.add(raw);
            }
        }
        return tokens;
    }

    private CategorySuggestionDto empty() {
        return new CategorySuggestionDto(null, null, 0.0);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private static Map<String, String> buildDefaultKeywordMap() {
        Map<String, String> map = new HashMap<>();
        putAll(map, "Food & Dining", "restaurant", "cafe", "coffee", "starbucks", "mcdonalds", "pizza",
                "grocery", "groceries", "supermarket", "food", "dining", "lunch", "dinner", "bar", "bakery");
        putAll(map, "Transportation", "uber", "lyft", "taxi", "gas", "fuel", "parking", "transit", "metro",
                "bus", "train", "flight", "airline", "toll");
        putAll(map, "Utilities", "electric", "electricity", "water", "internet", "phone", "mobile", "utility",
                "gasbill", "sewer", "cable");
        putAll(map, "Housing", "rent", "mortgage", "landlord", "lease", "hoa");
        putAll(map, "Healthcare", "pharmacy", "doctor", "dentist", "hospital", "clinic", "medical", "health",
                "insurance");
        putAll(map, "Shopping", "amazon", "walmart", "target", "store", "shop", "mall", "clothing", "shoes");
        putAll(map, "Education", "tuition", "school", "university", "course", "book", "udemy", "coursera");
        putAll(map, "Subscriptions", "netflix", "spotify", "hulu", "disney", "subscription", "prime",
                "youtube", "membership");
        putAll(map, "Personal Care", "salon", "haircut", "barber", "spa", "gym", "fitness");
        putAll(map, "Salary", "salary", "payroll", "paycheck", "wages");
        putAll(map, "Freelance", "freelance", "invoice", "client", "contract", "upwork", "fiverr");
        putAll(map, "Investments", "dividend", "interest", "stock", "crypto", "investment");
        return map;
    }

    private static void putAll(Map<String, String> map, String category, String... keywords) {
        Arrays.stream(keywords).forEach(k -> map.put(k, category));
    }
}
