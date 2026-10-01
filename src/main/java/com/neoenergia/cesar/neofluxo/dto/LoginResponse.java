package com.neoenergia.cesar.neofluxo.dto; import com.neoenergia.cesar.neofluxo.entity.User; import java.util.*;
public record LoginResponse(String token, UserView user){ public record UserView(UUID id,String name,String email,String role,String department){} }
