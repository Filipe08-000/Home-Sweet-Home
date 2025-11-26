<?php
include 'conexao.php';
if (!isset($_SESSION['usuario_id'])) { header("Location: login.php"); exit; }

$id_reserva = $_POST['id'];
// Atualiza status para Cancelada
$conn->query("UPDATE reservas SET status = 'Cancelada' WHERE id = $id_reserva");

// Volta para a página anterior (seja viagens ou reservas)
header("Location: " . $_SERVER['HTTP_REFERER']);
?>