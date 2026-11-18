package com.teladelogin.logincrud.dto;

import com.teladelogin.logincrud.model.Usuario;

public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        String cargo,
        String telefone,
        String biografia,
        String fotoUrl,
        String funcao,
        String status
) {

    public static UsuarioResponse de(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCargo(),
                usuario.getTelefone(),
                usuario.getBiografia(),
                usuario.getFotoUrl(),
                usuario.getFuncao(),
                usuario.getStatus()
        );
    }
}