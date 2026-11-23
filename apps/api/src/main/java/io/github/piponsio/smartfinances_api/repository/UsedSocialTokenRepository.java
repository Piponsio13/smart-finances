package io.github.piponsio.smartfinances_api.repository;
import java.time.Instant;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import io.github.piponsio.smartfinances_api.entity.UsedSocialToken;
public interface UsedSocialTokenRepository extends JpaRepository<UsedSocialToken, String> {
    @Modifying
    @Query(value = "INSERT INTO used_social_tokens (digest, expires_at) VALUES (:digest, :expires) ON CONFLICT DO NOTHING", nativeQuery = true)
    int consume(@Param("digest") String digest, @Param("expires") Instant expires);
    void deleteByExpiresAtBefore(Instant now);
}
