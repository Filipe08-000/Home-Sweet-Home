<?php
include 'conexao.php';
include 'header.php';

if (!isset($_SESSION['usuario_id'])) { header("Location: login.php"); exit; }

$anfitriao = $_SESSION['usuario_id'];
$locatario = $_GET['locatario_id'];
$imovel = $_GET['imovel_id'];

// Busca nome do locatário
$nome_loc = $conn->query("SELECT nome FROM usuarios WHERE id = $locatario")->fetch_assoc()['nome'];
// Busca info do imóvel
$titulo = $conn->query("SELECT titulo FROM imoveis WHERE id = $imovel")->fetch_assoc()['titulo'];

// Busca mensagens (usando coluna 'texto')
$sql = "SELECT * FROM mensagens WHERE imovel_id = $imovel AND 
        ((remetente_id = $anfitriao AND destinatario_id = $locatario) OR 
         (remetente_id = $locatario AND destinatario_id = $anfitriao)) 
        ORDER BY data_envio ASC";
$msgs = $conn->query($sql);
?>

<div class="container mt-5">
    <h3>Chat: <?php echo $titulo; ?> <small class="text-muted">(com <?php echo $nome_loc; ?>)</small></h3>
    <div class="card">
        <div class="card-body" style="height: 400px; overflow-y: auto; background: #f8f9fa;">
            <?php while($msg = $msgs->fetch_assoc()): 
                $eu = ($msg['remetente_id'] == $anfitriao);
            ?>
            <div class="d-flex mb-2 <?php echo $eu ? 'justify-content-end' : 'justify-content-start'; ?>">
                <div class="p-2 rounded <?php echo $eu ? 'bg-primary text-white' : 'bg-white border'; ?>" style="max-width: 70%;">
                    <?php echo htmlspecialchars($msg['texto']); ?>
                </div>
            </div>
            <?php endwhile; ?>
        </div>
        <div class="card-footer">
            <form action="enviar_mensagem.php" method="POST" class="d-flex">
                <input type="hidden" name="imovel_id" value="<?php echo $imovel; ?>">
                <input type="hidden" name="destinatario_id" value="<?php echo $locatario; ?>">
                <input type="hidden" name="origem" value="host"> 
                <input type="text" name="mensagem" class="form-control me-2" required placeholder="Responder...">
                <button class="btn btn-primary">Enviar</button>
            </form>
        </div>
    </div>
</div>
<?php include 'footer.php'; ?>