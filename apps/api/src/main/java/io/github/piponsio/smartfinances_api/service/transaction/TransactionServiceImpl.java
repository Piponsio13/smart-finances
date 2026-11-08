package io.github.piponsio.smartfinances_api.service.transaction;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.github.piponsio.smartfinances_api.dto.request.TransactionFilterDto;
import io.github.piponsio.smartfinances_api.dto.request.TransactionRequestDto;
import io.github.piponsio.smartfinances_api.dto.request.TransactionSummaryRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.CategorySuggestionDto;
import io.github.piponsio.smartfinances_api.dto.response.TransactionResponseDto;
import io.github.piponsio.smartfinances_api.dto.response.TransactionSummaryDto;
import io.github.piponsio.smartfinances_api.service.category.CategorySuggestionService;
import io.github.piponsio.smartfinances_api.entity.Category;
import io.github.piponsio.smartfinances_api.entity.Transaction;
import io.github.piponsio.smartfinances_api.entity.User;
import io.github.piponsio.smartfinances_api.enums.TransactionType;
import io.github.piponsio.smartfinances_api.exception.ResourceNotFoundException;
import java.time.LocalDateTime;
import io.github.piponsio.smartfinances_api.repository.CategoryRepository;
import io.github.piponsio.smartfinances_api.repository.TransactionRepository;
import io.github.piponsio.smartfinances_api.utils.AuthUser;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final CategorySuggestionService categorySuggestionService;
    private final AuthUser authUser;

    @Override
    public CategorySuggestionDto suggestCategory(String description, TransactionType type) {
        User user = authUser.getAuthenticatedUser();
        return categorySuggestionService.suggest(user.getId(), description, type);
    }

    @Override
    @Transactional
    public void createTransaction(TransactionRequestDto transactionRequestDto) {
        User user = authUser.getAuthenticatedUser();
        Transaction transaction = new Transaction();
        Category category = getCategory(transactionRequestDto.getCategoryId(), user.getId());
        transaction.setAmount(transactionRequestDto.getAmount());
        transaction.setCategory(category);
        transaction.setDescription(transactionRequestDto.getDescription());
        transaction.setType(transactionRequestDto.getType());
        transaction.setUser(user);
        transaction.setDate(transactionRequestDto.getDate());
        transaction.setCurrency(transactionRequestDto.getCurrency() != null ? transactionRequestDto.getCurrency() : "USD");
        transactionRepository.save(transaction);
    }

    @Override
    public List<TransactionResponseDto> getAllTransactions(TransactionFilterDto filterDto) {
        User user = authUser.getAuthenticatedUser();
        Specification<Transaction> spec = getTransactionSpecification(filterDto, user.getId());

        return transactionRepository.findAll(spec)
                .stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    public TransactionResponseDto getTransaction(Long id) {
        Transaction transaction = findTransactionByIdAndUserId(id, authUser.getAuthenticatedUser().getId());

        return mapToResponseDto(transaction);
    }

    @Override
    @Transactional
    public void updateTransaction(Long id, TransactionRequestDto request) {
        User user = authUser.getAuthenticatedUser();
        Transaction transaction = findTransactionByIdAndUserId(id, user.getId());

        Category category = getCategory(request.getCategoryId(), user.getId());

        transaction.setAmount(request.getAmount());
        transaction.setCategory(category);
        transaction.setDate(request.getDate());
        transaction.setType(request.getType());
        transaction.setDescription(request.getDescription());
        transaction.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");

        transactionRepository.save(transaction);

    }

    @Override
    @Transactional
    public void deleteTransaction(Long id) {
        User user = authUser.getAuthenticatedUser();
        Transaction transaction = findTransactionByIdAndUserId(id, user.getId());

        transactionRepository.delete(transaction);
    }

    @Override
    public TransactionSummaryDto getSummary(TransactionSummaryRequestDto requestDto) {
        User user = authUser.getAuthenticatedUser();

        List<Transaction> transactions;
        if (requestDto.getMonth() != null && requestDto.getYear() != null) {
            LocalDateTime start = LocalDateTime.of(requestDto.getYear(), requestDto.getMonth(), 1, 0, 0);
            LocalDateTime end = start.plusMonths(1);
            transactions = transactionRepository.findByUserIdAndDateBetween(user.getId(), start, end);
        } else {
            transactions = transactionRepository.findByUserId(user.getId());
        }

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        for (Transaction transaction : transactions) {
            if (transaction.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(transaction.getAmount());
            } else if (transaction.getType() == TransactionType.EXPENSE) {
                totalExpenses = totalExpenses.add(transaction.getAmount());
            }
        }

        BigDecimal balance = totalIncome.subtract(totalExpenses);

        TransactionSummaryDto summaryDto = new TransactionSummaryDto();
        summaryDto.setBalance(balance);
        summaryDto.setTotalExpenses(totalExpenses);
        summaryDto.setTotalIncome(totalIncome);
        summaryDto.setTransactionCount(transactions.size());

        return summaryDto;
    }

    @Override
    public String exportToCsv(TransactionFilterDto filterDto) {
        User user = authUser.getAuthenticatedUser();
        Specification<Transaction> spec = getTransactionSpecification(filterDto, user.getId());
        List<Transaction> transactions = transactionRepository.findAll(spec);

        StringBuilder csv = new StringBuilder();
        csv.append("id,date,amount,type,category,description\n");
        for (Transaction t : transactions) {
            csv.append(t.getId()).append(",")
               .append(t.getDate()).append(",")
               .append(t.getAmount()).append(",")
               .append(t.getType()).append(",")
               .append('"').append(t.getCategory().getName().replace("\"", "\"\"")).append('"').append(",")
               .append('"').append(t.getDescription().replace("\"", "\"\"")).append('"').append("\n");
        }
        return csv.toString();
    }

    @Override
    public byte[] exportToPdf(TransactionFilterDto filterDto) {
        User user = authUser.getAuthenticatedUser();
        Specification<Transaction> spec = getTransactionSpecification(filterDto, user.getId());
        List<Transaction> transactions = transactionRepository.findAll(spec);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            com.lowagie.text.Document doc = new com.lowagie.text.Document(com.lowagie.text.PageSize.A4);
            com.lowagie.text.pdf.PdfWriter.getInstance(doc, out);
            doc.open();

            com.lowagie.text.Font titleFont = new com.lowagie.text.Font(
                    com.lowagie.text.Font.HELVETICA, 18, com.lowagie.text.Font.BOLD);
            com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph("Transaction Report", titleFont);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            title.setSpacingAfter(6);
            doc.add(title);

            com.lowagie.text.Font subFont = new com.lowagie.text.Font(
                    com.lowagie.text.Font.HELVETICA, 10, com.lowagie.text.Font.ITALIC);
            com.lowagie.text.Paragraph generated = new com.lowagie.text.Paragraph(
                    "Generated on " + java.time.LocalDateTime.now()
                            .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                    subFont);
            generated.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            generated.setSpacingAfter(20);
            doc.add(generated);

            com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2.5f, 1.5f, 1.5f, 2f, 3f});

            com.lowagie.text.Font headerFont = new com.lowagie.text.Font(
                    com.lowagie.text.Font.HELVETICA, 10, com.lowagie.text.Font.BOLD,
                    new java.awt.Color(255, 255, 255));
            java.awt.Color headerBg = new java.awt.Color(45, 85, 175);
            for (String h : new String[]{"Date", "Amount", "Type", "Category", "Description"}) {
                com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(
                        new com.lowagie.text.Phrase(h, headerFont));
                cell.setBackgroundColor(headerBg);
                cell.setPadding(8);
                cell.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            com.lowagie.text.Font cellFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 9);
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            boolean alt = false;
            for (Transaction t : transactions) {
                java.awt.Color rowBg = alt ? new java.awt.Color(240, 240, 240) : java.awt.Color.WHITE;
                for (String text : new String[]{
                        t.getDate().format(fmt),
                        t.getAmount().toPlainString(),
                        t.getType().name(),
                        t.getCategory().getName(),
                        t.getDescription()}) {
                    com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(
                            new com.lowagie.text.Phrase(text != null ? text : "", cellFont));
                    cell.setBackgroundColor(rowBg);
                    cell.setPadding(6);
                    table.addCell(cell);
                }
                alt = !alt;
            }
            doc.add(table);

            BigDecimal totalIncome = transactions.stream()
                    .filter(t -> t.getType() == TransactionType.INCOME)
                    .map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalExpenses = transactions.stream()
                    .filter(t -> t.getType() == TransactionType.EXPENSE)
                    .map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

            com.lowagie.text.Font summaryFont = new com.lowagie.text.Font(
                    com.lowagie.text.Font.HELVETICA, 10, com.lowagie.text.Font.BOLD);
            com.lowagie.text.Paragraph summary = new com.lowagie.text.Paragraph(
                    String.format("Total Income: %s  |  Total Expenses: %s  |  Balance: %s",
                            totalIncome.toPlainString(),
                            totalExpenses.toPlainString(),
                            totalIncome.subtract(totalExpenses).toPlainString()),
                    summaryFont);
            summary.setSpacingBefore(15);
            doc.add(summary);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private TransactionResponseDto mapToResponseDto(Transaction transaction) {
        TransactionResponseDto responseDto = new TransactionResponseDto();
        Category category = transaction.getCategory();
        responseDto.setId(transaction.getId());
        responseDto.setAmount(transaction.getAmount());
        responseDto.setCategoryName(category.getName());
        responseDto.setDate(transaction.getDate());
        responseDto.setDescription(transaction.getDescription());
        responseDto.setType(transaction.getType());
        responseDto.setCurrency(transaction.getCurrency() != null ? transaction.getCurrency() : "USD");
        return responseDto;
    }

    private Transaction findTransactionByIdAndUserId(Long id, Long userId) {
        return transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
    }

    private Category getCategory(Long categoryId, Long userId) {
        return categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private Specification<Transaction> getTransactionSpecification(TransactionFilterDto filterDto, Long userId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (filterDto.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), filterDto.getCategoryId()));
            }
            if (filterDto.getType() != null) {
                predicates.add(cb.equal(root.get("type"), filterDto.getType()));
            }
            if (filterDto.getDateFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("date"), filterDto.getDateFrom()));
            }
            if (filterDto.getDateTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("date"), filterDto.getDateTo()));
            }
            if (filterDto.getMinAmount() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("amount"), filterDto.getMinAmount()));
            }
            if (filterDto.getMaxAmount() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("amount"), filterDto.getMaxAmount()));
            }
            if (filterDto.getDescription() != null && !filterDto.getDescription().isEmpty()) {
                predicates.add(
                        cb.like(cb.lower(root.get("description")),
                                "%" + filterDto.getDescription().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
