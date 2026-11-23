package io.github.piponsio.smartfinances_api.repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import io.github.piponsio.smartfinances_api.entity.SocialIdentity;
public interface SocialIdentityRepository extends JpaRepository<SocialIdentity, Long> {
    Optional<SocialIdentity> findByProviderAndSubject(String provider, String subject);
}
