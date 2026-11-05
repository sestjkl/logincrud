package com.teladelogin.logincrud.repository;

import com.teladelogin.logincrud.model.Usuario;
// ALTERAÇÃO: Importamos o JpaRepository do Spring Data JPA para herdar
// os métodos prontos de persistência e comunicação com o banco de dados.
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
// ALTERAÇÃO: Mudamos de 'public class UsuarioRepository' para 'public interface'
// e fizemos ela estender 'JpaRepository<Usuario, Long>'.
// O Spring Data JPA agora implementa automaticamente todas as operações de banco
// (salvar, listar, buscar por ID, deletar), removendo a necessidade da lista em memória (ArrayList).
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // ALTERAÇÃO: Adicionamos o método personalizado 'findByEmail'.
    // O Spring interpreta o nome deste método automaticamente e gera a query SQL
    // para buscar um usuário pelo seu e-mail no PostgreSQL, o que será essencial para o fluxo de login.
    Optional<Usuario> findByEmail(String email);

}