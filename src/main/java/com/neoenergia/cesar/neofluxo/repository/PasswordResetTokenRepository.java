package com.neoenergia.cesar.neofluxo.repository;

import com.neoenergia.cesar.neofluxo.entity.PasswordResetToken;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    /** Trava a linha: dois cliques no mesmo link não redefinem a senha duas vezes. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    /** Apaga os tokens ainda não usados do usuário (pedido novo invalida os anteriores). */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from PasswordResetToken t where t.user.id = :userId and t.usedAt is null")
    int deleteUnusedByUserId(@Param("userId") UUID userId);
}
