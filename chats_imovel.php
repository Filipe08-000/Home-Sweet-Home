<?php
include 'conexao.php';
include 'header.php';

if (!isset($_SESSION['usuario_id'])) { header("Location: login.php"); exit; }
$imovel_id = $_GET['id'];
$dono = $_SESSION['usuario_id'];

// Verifica dono
$check = $conn->query("SELECT id FROM imoveis WHERE id = $imovel_id AND dono_id = $dono");
if($check->num_rows == 0) { die("Acesso negado."); }

// Busca conversas agrupadas
$sql = "SELECT MAX(data_envio) as data, u.nome, u.id as locatario_id 
        FROM mensagens m 
        JOIN usuarios u ON m.remetente_id = u.id 
        WHERE m.imovel_id = $imovel_id AND m.destinatario_id = $dono 
        GROUP BY m.remetente_id ORDER BY data DESC";
$chats = $conn->query($sql);
?>

<div class="container mt-5">
    <h2>Conversas do Imóvel</h2>
    <a href="painel.php" class="btn btn-secondary mb-3">Voltar</a>
    <div class="list-group">
        <?php if($chats->num_rows == 0) echo "<p>Nenhuma mensagem recebida.</p>"; ?>
        <?php while($row = $chats->fetch_assoc()): ?>
            <a href="chat.php?imovel_id=<?php echo $imovel_id; ?>&locatario_id=<?php echo $row['locatario_id']; ?>" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1"><?php echo $row['nome']; ?></h5>
                    <small>Última mensagem: <?php echo date('d/m H:i', strtotime($row['data'])); ?></small>
                </div>
                <span class="badge bg-primary rounded-pill">Responder</span>
            </a>
        <?php endwhile; ?>
    </div>
</div>
<?php include 'footer.php'; ?>