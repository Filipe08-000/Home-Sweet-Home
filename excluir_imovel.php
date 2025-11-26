<?php
include 'conexao.php';
if (!isset($_SESSION['usuario_id'])) { header("Location: login.php"); exit; }

$id = $_POST['id'];
$dono = $_SESSION['usuario_id'];

// Deleta dependências primeiro
$conn->query("DELETE FROM mensagens WHERE imovel_id = $id");
$conn->query("DELETE FROM avaliacoes WHERE imovel_id = $id");
$conn->query("DELETE FROM reservas WHERE imovel_id = $id");
// Deleta imóvel
$conn->query("DELETE FROM imoveis WHERE id = $id AND dono_id = $dono");

header("Location: painel.php");