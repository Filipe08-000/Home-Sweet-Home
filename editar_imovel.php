<?php
include 'conexao.php';
include 'header.php';

if (!isset($_SESSION['usuario_id'])) { header("Location: login.php"); exit; }
$id = $_GET['id'];
$dono = $_SESSION['usuario_id'];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $titulo = $conn->real_escape_string($_POST['titulo']);
    $cidade = $conn->real_escape_string($_POST['cidade']);
    $descricao = $conn->real_escape_string($_POST['descricao']);
    $preco = $_POST['preco'];
    
    $conn->query("UPDATE imoveis SET titulo='$titulo', cidade='$cidade', descricao='$descricao', preco_diaria='$preco' WHERE id=$id AND dono_id=$dono");
    header("Location: painel.php");
}

$imovel = $conn->query("SELECT * FROM imoveis WHERE id=$id AND dono_id=$dono")->fetch_assoc();
?>

<div class="container mt-5">
    <h2>Editar Imóvel</h2>
    <form method="POST">
        <label>Título</label>
        <input type="text" name="titulo" class="form-control mb-2" value="<?php echo $imovel['titulo']; ?>">
        <label>Cidade</label>
        <input type="text" name="cidade" class="form-control mb-2" value="<?php echo $imovel['cidade']; ?>">
        <label>Descrição</label>
        <textarea name="descricao" class="form-control mb-2" rows="4"><?php echo $imovel['descricao']; ?></textarea>
        <label>Preço</label>
        <input type="number" name="preco" class="form-control mb-2" value="<?php echo $imovel['preco_diaria']; ?>">
        <button class="btn btn-primary">Salvar</button>
    </form>
</div>
<?php include 'footer.php'; ?>