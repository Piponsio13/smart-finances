package io.github.piponsio.smartfinances_api.entity;

import java.time.Instant;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity @Table(name = "used_social_tokens") @Getter @Setter
public class UsedSocialToken {
    @Id @Column(length = 64)
    private String digest;
    @Column(nullable = false)
    private Instant expiresAt;
}
