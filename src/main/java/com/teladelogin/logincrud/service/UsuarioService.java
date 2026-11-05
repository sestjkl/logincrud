package com.teladelogin.logincrud.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.teladelogin.logincrud.model.Usuario;
import com.teladelogin.logincrud.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    // Seu Client ID gerado no Google Cloud Console
    private static final String CLIENT_ID = "690401635450-q8l6o1ktvcbucr6f938hgbqvt6obuauk.apps.googleusercontent.com";

    // Injetamos o PasswordEncoder no construtor junto com o repositório
    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario salvar(Usuario usuario) {
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new IllegalArgumentException("E-mail já cadastrado");
        }

        // Criptografamos a senha antes de persistir o usuário no banco de dados
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));

        return usuarioRepository.save(usuario);
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> atualizar(Long id, Usuario dados) {
        Optional<Usuario> existente = usuarioRepository.findById(id);

        if (existente.isEmpty()) {
            return Optional.empty();
        }

        Optional<Usuario> usuarioComMesmoEmail = usuarioRepository.findByEmail(dados.getEmail());
        if (usuarioComMesmoEmail.isPresent() && !usuarioComMesmoEmail.get().getId().equals(id)) {
            throw new IllegalArgumentException("E-mail já cadastrado");
        }

        Usuario usuario = existente.get();
        usuario.setNome(dados.getNome());
        usuario.setEmail(dados.getEmail());

        // Atualiza os novos campos textuais do perfil
        usuario.setCargo(dados.getCargo());
        usuario.setTelefone(dados.getTelefone());
        usuario.setBiografia(dados.getBiografia());

        // Só atualiza a foto se uma nova foi enviada (string em Base64 ou URL válida)
        if (dados.getFotoUrl() != null && !dados.getFotoUrl().isEmpty()) {
            usuario.setFotoUrl(dados.getFotoUrl());
        }

        // Criptografamos a senha nova caso ela tenha sido informada na atualização
        if (dados.getSenha() != null && !dados.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dados.getSenha()));
        }

        return Optional.of(usuarioRepository.save(usuario));
    }

    public boolean deletar(Long id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // ==========================================
    // PROCESSAMENTO E AUTO-CADASTRO GOOGLE
    // ==========================================
    public Usuario processarLoginGoogle(String idTokenString) {
        try {
            log.info("Iniciando a verificação do token do Google...");

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(CLIENT_ID))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();

                String email = payload.getEmail();
                String nome = (String) payload.get("name");

                log.info("Token do Google verificado com sucesso para o e-mail: {}", email);

                // Verifica se o usuário já existe no Supabase. Se não existir, cadastra automaticamente!
                return usuarioRepository.findByEmail(email)
                        .map(usuarioExistente -> {
                            log.info("Usuário já cadastrado no banco. Realizando login: {}", email);
                            return usuarioExistente;
                        })
                        .orElseGet(() -> {
                            log.info("Usuário não encontrado. Criando novo cadastro automático para: {}", email);
                            Usuario novoUsuario = new Usuario();
                            novoUsuario.setNome(nome != null ? nome : "Usuário Google");
                            novoUsuario.setEmail(email);
                            // Define uma senha padrão encriptada para contas de login social
                            novoUsuario.setSenha(passwordEncoder.encode("GOOGLE_OAUTH_USER_DEFAULT"));
                            return usuarioRepository.save(novoUsuario);
                        });
            } else {
                log.warn("A verificação retornou um token nulo (inválido ou expirado).");
                throw new IllegalArgumentException("Token do Google inválido.");
            }
        } catch (Exception e) {
            log.error("Erro crítico ao processar autenticação com o Google: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao processar autenticação com o Google: " + e.getMessage());
        }
    }
}