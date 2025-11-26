<?php
include 'conexao.php';

if (!isset($_SESSION['usuario_id'])) { header("Location: index.php"); exit; }

$user = $_SESSION['usuario_id'];
$imovel = $_POST['imovel_id'];
$nota = $_POST['nota'];
$comentario = $conn->real_escape_string($_POST['comentario']);

// Insere ou Atualiza (ON DUPLICATE KEY UPDATE)
$sql = "INSERT INTO avaliacoes (imovel_id, usuario_id, nota, comentario) VALUES ('$imovel', '$user', '$nota', '$comentario')
        ON DUPLICATE KEY UPDATE nota='$nota', comentario='$comentario'";

$conn->query($sql);
header("Location: detalhes.php?id=$imovel&sucesso=avaliacao");
?>