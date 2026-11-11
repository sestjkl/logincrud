package com.teladelogin.logincrud.controller;

import com.teladelogin.logincrud.model.Usuario;
import com.teladelogin.logincrud.service.UsuarioService;
import com.teladelogin.logincrud.dto.UsuarioResponse;
import com.teladelogin.logincrud.dto.GoogleTokenRequest;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
    private final UsuarioService service;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioService service, PasswordEncoder passwordEncoder) {
        this.service = service;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> cadastrar(@Valid @RequestBody Usuario usuario) {
        Usuario criado = service.salvar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(UsuarioResponse.de(criado));
    }

    // ==========================================
    // ENDPOINT DE LOGIN COM O GOOGLE
    // ==========================================
    @PostMapping("/google")
    public ResponseEntity<?> loginGoogle(@RequestBody GoogleTokenRequest request) {
        try {
            Usuario usuario = service.processarLoginGoogle(request.getToken());
            return ResponseEntity.ok(UsuarioResponse.de(usuario));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // ==========================================
    // LOGIN TRADICIONAL (POR NOME DE USUÁRIO E SENHA)
    // ==========================================
    @PostMapping("/login")
    public ResponseEntity<?> loginTradicional(@RequestBody Usuario dadosLogin) {
        try {
            // Bloqueia tentativas de login manual com o nome "admin" ou "administrador"
            if (dadosLogin.getNome() != null &&
                    (dadosLogin.getNome().equalsIgnoreCase("admin") || dadosLogin.getNome().equalsIgnoreCase("administrador"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Acesso negado: o usuário administrador não pode logar por este formulário.");
            }

            // Busca o usuário pelo NOME (ou username)
            Usuario usuario = service.listarTodos().stream()
                    .filter(u -> u.getNome() != null && u.getNome().equalsIgnoreCase(dadosLogin.getNome()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

            // Valida a senha usando o PasswordEncoder injetado
            if (usuario.getSenha() == null || !passwordEncoder.matches(dadosLogin.getSenha(), usuario.getSenha())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Senha incorreta.");
            }

            return ResponseEntity.ok(UsuarioResponse.de(usuario));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // ==========================================
    // MÉTRICAS PARA O DASHBOARD (Main.html)
    // ==========================================
    @GetMapping("/metricas")
    public ResponseEntity<?> obterMetricas() {
        List<Usuario> usuarios = service.listarTodos();
        long total = usuarios.size();
        long ativos = usuarios.stream().filter(u -> "Ativo".equalsIgnoreCase(u.getStatus())).count();
        long admins = usuarios.stream().filter(u -> "Administrador".equalsIgnoreCase(u.getFuncao())).count();

        return ResponseEntity.ok(Map.of(
                "totalUsuarios", total,
                "usuariosAtivos", ativos,
                "administradores", admins,
                "novosCadastros", total
        ));
    }

    @GetMapping
    public List<UsuarioResponse> listar() {
        return service.listarTodos().stream().map(UsuarioResponse::de).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(UsuarioResponse::de)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> atualizar(@PathVariable Long id,
                                                     @RequestBody Usuario dados) {
        return service.atualizar(id, dados)
                .map(UsuarioResponse::de)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id){
        if(service.deletar(id)){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> tratarErro(IllegalArgumentException e){
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }
}