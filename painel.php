<?php
include 'conexao.php';
include 'header.php';

if (!isset($_SESSION['usuario_id'])) { header("Location: login.php"); exit; }
$dono = $_SESSION['usuario_id'];
$imoveis = $conn->query("SELECT * FROM imoveis WHERE dono_id = $dono");
?>
<div class="container mt-5">
    <h2>Painel do Anfitrião</h2>
    <a href="cadastrar_imovel.php" class="btn btn-success mb-3">Novo Imóvel</a>
    <table class="table">
        <?php while($row = $imoveis->fetch_assoc()): ?>
        <tr>
            <td><?php echo $row['titulo']; ?></td>
            <td>
                <a href="chats_imovel.php?id=<?php echo $row['id']; ?>" class="btn btn-info btn-sm">Chats</a>
                <a href="editar_imovel.php?id=<?php echo $row['id']; ?>" class="btn btn-secondary btn-sm">Editar</a>
                <form action="excluir_imovel.php" method="POST" class="d-inline">
                    <input type="hidden" name="id" value="<?php echo $row['id']; ?>">
                    <button class="btn btn-danger-dark btn-sm">Excluir</button>
                </form>
            </td>
        </tr>
        <?php endwhile; ?>
    </table>
</div>
<?php include 'footer.php'; ?>