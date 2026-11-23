package io.github.piponsio.smartfinances_api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "social_identities", uniqueConstraints = @UniqueConstraint(columnNames = {"provider", "subject"}))
@Getter @Setter
public class SocialIdentity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 16)
    private String provider;
    @Column(nullable = false)
    private String subject;
    @ManyToOne(optional = false) @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
