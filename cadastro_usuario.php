<?php
include 'conexao.php';
include 'header.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nome = $conn->real_escape_string($_POST['nome']);
    $email = $conn->real_escape_string($_POST['email']);
    $senha = password_hash($_POST['senha'], PASSWORD_DEFAULT);

    $sql = "INSERT INTO usuarios (nome, email, senha) VALUES ('$nome', '$email', '$senha')";
    
    if ($conn->query($sql) === TRUE) {
        echo "<script>alert('Cadastro realizado! Faça login.'); window.location='login.php';</script>";
    } else {
        $erro = "Erro: Email já cadastrado.";
    }
}
?>

<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-4">
            <div class="card shadow p-4">
                <h3 class="text-center mb-4">Criar Conta</h3>
                <?php if (isset($erro)) echo "<div class='alert alert-danger'>$erro</div>"; ?>
                <form method="POST">
                    <div class="mb-3">
                        <label>Nome Completo</label>
                        <input type="text" name="nome" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label>Email</label>
                        <input type="email" name="email" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label>Senha</label>
                        <input type="password" name="senha" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-danger w-100">Cadastrar</button>
                </form>
            </div>
        </div>
    </div>
</div>

<?php include 'footer.php'; ?>