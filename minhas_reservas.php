<?php
include 'conexao.php';
include 'header.php';

if (!isset($_SESSION['usuario_id'])) { header("Location: login.php"); exit; }
$dono = $_SESSION['usuario_id'];

$sql = "SELECT r.*, i.titulo, u.nome as locatario_nome, u.id as locatario_id 
        FROM reservas r 
        JOIN imoveis i ON r.imovel_id = i.id 
        JOIN usuarios u ON r.usuario_id = u.id 
        WHERE i.dono_id = $dono ORDER BY r.data_inicio DESC";
$result = $conn->query($sql);
?>

<div class="container mt-5">
    <h2>Reservas em meus Imóveis</h2>
    <table class="table mt-3">
        <thead class="table-dark">
            <tr><th>Imóvel</th><th>Hóspede</th><th>Datas</th><th>Status</th><th>Ações</th></tr>
        </thead>
        <tbody>
        <?php while($row = $result->fetch_assoc()): ?>
            <tr>
                <td><?php echo $row['titulo']; ?></td>
                <td><?php echo $row['locatario_nome']; ?></td>
                <td><?php echo date('d/m', strtotime($row['data_inicio'])) . ' - ' . date('d/m', strtotime($row['data_fim'])); ?></td>
                <td>
                    <?php echo ($row['status'] == 'Cancelada') ? '<span class="badge bg-danger">Cancelada</span>' : '<span class="badge bg-success">Confirmada</span>'; ?>
                </td>
                <td>
                    <a href="chat.php?imovel_id=<?php echo $row['imovel_id']; ?>&locatario_id=<?php echo $row['locatario_id']; ?>" class="btn btn-primary btn-sm">Chat</a>
                    <?php if($row['status'] != 'Cancelada'): ?>
                        <form action="cancelar_reserva.php" method="POST" class="d-inline" onsubmit="return confirm('Cancelar reserva deste hóspede?');">
                            <input type="hidden" name="id" value="<?php echo $row['id']; ?>">
                            <button class="btn btn-danger btn-sm">Cancelar</button>
                        </form>
                    <?php endif; ?>
                </td>
            </tr>
        <?php endwhile; ?>
        </tbody>
    </table>
</div>
<?php include 'footer.php'; ?>