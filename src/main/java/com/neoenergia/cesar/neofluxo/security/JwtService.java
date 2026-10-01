package com.neoenergia.cesar.neofluxo.security;
import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys; import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Service; import java.nio.charset.StandardCharsets; import java.security.Key; import java.util.*;
@Service public class JwtService { private final Key key; private final long expiration;
 public JwtService(@Value("${app.jwt.secret}") String secret,@Value("${app.jwt.expiration-ms}") long expiration){ if(secret.length()<32) throw new IllegalArgumentException("JWT_SECRET precisa ter pelo menos 32 caracteres"); key=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); this.expiration=expiration; }
 public String generate(UUID id,String email,String role){return Jwts.builder().subject(id.toString()).claim("email",email).claim("role",role).issuedAt(new Date()).expiration(new Date(System.currentTimeMillis()+expiration)).signWith(key).compact();}
 public Claims parse(String token){return Jwts.parser().verifyWith((javax.crypto.SecretKey)key).build().parseSignedClaims(token).getPayload();}
}
