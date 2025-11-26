<?php
include 'conexao.php';
include 'header.php';

if (!isset($_SESSION['usuario_id'])) { header("Location: login.php"); exit; }

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $titulo = $conn->real_escape_string($_POST['titulo']);
    $cidade = $conn->real_escape_string($_POST['cidade']);
    $descricao = $conn->real_escape_string($_POST['descricao']);
    $preco = $_POST['preco'];
    $dono = $_SESSION['usuario_id'];
    
    $img_name = time() . $_FILES['imagem']['name'];
    move_uploaded_file($_FILES['imagem']['tmp_name'], "uploads/" . $img_name);

    $conn->query("INSERT INTO imoveis (dono_id, titulo, cidade, descricao, preco_diaria, imagem) VALUES ('$dono', '$titulo', '$cidade', '$descricao', '$preco', '$img_name')");
    echo "<div class='alert alert-success'>Cadastrado!</div>";
}
?>
<div class="container mt-5">
    <h2>Novo Anúncio</h2>
    <form method="POST" enctype="multipart/form-data">
        <input type="text" name="titulo" class="form-control mb-2" placeholder="Título" required>
        <input type="text" name="cidade" class="form-control mb-2" placeholder="Cidade" required>
        <textarea name="descricao" class="form-control mb-2" placeholder="Descrição completa..." required></textarea>
        <input type="number" name="preco" class="form-control mb-2" placeholder="Preço Diária" required>
        <input type="file" name="imagem" class="form-control mb-2" required>
        <button class="btn btn-success w-100">Cadastrar</button>
    </form>
</div>
<?php include 'footer.php'; ?>