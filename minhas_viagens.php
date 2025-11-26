<?php
include 'conexao.php';
include 'header.php';

if (!isset($_SESSION['usuario_id'])) { header("Location: login.php"); exit; }
$id = $_SESSION['usuario_id'];

$sql = "SELECT r.*, i.titulo, i.cidade FROM reservas r JOIN imoveis i ON r.imovel_id = i.id WHERE r.usuario_id = $id ORDER BY r.data_inicio DESC";
$result = $conn->query($sql);
?>

<div class="container mt-5">
    <h2>Minhas Viagens</h2>
    <?php if (isset($_GET['sucesso'])) echo "<div class='alert alert-success'>Ação realizada!</div>"; ?>
    
    <table class="table mt-3">
        <thead class="table-dark">
            <tr><th>Imóvel</th><th>Datas</th><th>Valor</th><th>Status</th><th>Ação</th></tr>
        </thead>
        <tbody>
        <?php while($row = $result->fetch_assoc()): ?>
            <tr>
                <td>
                    <strong><?php echo $row['titulo']; ?></strong><br>
                    <small><?php echo $row['cidade']; ?></small>
                </td>
                <td><?php echo date('d/m', strtotime($row['data_inicio'])) . ' até ' . date('d/m', strtotime($row['data_fim'])); ?></td>
                <td>R$ <?php echo number_format($row['valor_total'], 2, ',', '.'); ?></td>
                <td>
                    <?php if($row['status'] == 'Cancelada') echo '<span class="badge bg-danger">Cancelada</span>'; 
                          else echo '<span class="badge bg-success">Confirmada</span>'; ?>
                </td>
                <td>
                    <?php if($row['status'] != 'Cancelada'): ?>
                    <form action="cancelar_reserva.php" method="POST" onsubmit="return confirm('Cancelar reserva?');">
                        <input type="hidden" name="id" value="<?php echo $row['id']; ?>">
                        <button class="btn btn-outline-danger btn-sm">Cancelar</button>
                    </form>
                    <?php endif; ?>
                </td>
            </tr>
        <?php endwhile; ?>
        </tbody>
    </table>
</div>
<?php include 'footer.php'; ?>