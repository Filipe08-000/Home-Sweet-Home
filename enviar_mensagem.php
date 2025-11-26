<?php
include 'conexao.php';

if (!isset($_SESSION['usuario_id'])) { header("Location: index.php"); exit; }

$remetente = $_SESSION['usuario_id'];
$imovel = $_POST['imovel_id'];
$destinatario = $_POST['destinatario_id'];
$texto = $conn->real_escape_string($_POST['mensagem']);

// Inserir (coluna TEXTO, não mensagem)
$sql = "INSERT INTO mensagens (imovel_id, remetente_id, destinatario_id, texto) VALUES ('$imovel', '$remetente', '$destinatario', '$texto')";
$conn->query($sql);

// Se quem enviou foi o dono (via chat.php), volta pro chat.php, senão volta pro detalhes.php
if(isset($_POST['origem']) && $_POST['origem'] == 'host') {
    header("Location: chat.php?imovel_id=$imovel&locatario_id=$destinatario");
} else {
    header("Location: detalhes.php?id=$imovel");
}
?>