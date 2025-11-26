<?php
include 'conexao.php';

if (!isset($_SESSION['usuario_id'])) { header("Location: login.php"); exit; }

$user = $_SESSION['usuario_id'];
$imovel = $_POST['imovel_id'];
$in = $_POST['checkin'];
$out = $_POST['checkout'];
$metodo = $_POST['metodo'];
$card_num = substr($_POST['cartao_numero'] ?? '', -4);
$card_val = $_POST['cartao_validade'] ?? '';
$card_cvv = $_POST['cartao_cvv'] ?? '';

// Validação básica
if(!$imovel || !$in || !$out) { header("Location: detalhes.php?id=$imovel&erro=dados_faltando"); exit; }

// Verifica conflito
$check = $conn->query("SELECT id FROM reservas WHERE imovel_id = $imovel AND status != 'Cancelada' AND (('$out' > data_inicio) AND ('$in' < data_fim))");
if ($check->num_rows > 0) { header("Location: detalhes.php?id=$imovel&erro=conflito_datas"); exit; }

// Calcula valor
$price = $conn->query("SELECT preco_diaria FROM imoveis WHERE id = $imovel")->fetch_assoc()['preco_diaria'];
$d1 = new DateTime($in); $d2 = new DateTime($out);
$days = $d1->diff($d2)->days;
$total = $days * $price;
if ($metodo == 'pix') $total *= 0.9;

// Insere
$sql = "INSERT INTO reservas (imovel_id, usuario_id, data_inicio, data_fim, dias, valor_total, metodo_pagamento, cartao_final, cartao_validade, cartao_cvv, status) 
        VALUES ('$imovel', '$user', '$in', '$out', '$days', '$total', '$metodo', '$card_num', '$card_val', '$card_cvv', 'Confirmada')";

if ($conn->query($sql)) {
    header("Location: minhas_viagens.php?sucesso=reserva");
} else {
    echo $conn->error;
}
?>