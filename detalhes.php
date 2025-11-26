<?php
include 'conexao.php';
include 'header.php';

if (!isset($_GET['id'])) { header("Location: index.php"); exit; }

$id = $_GET['id']; 
$imovel = $conn->query("SELECT * FROM imoveis WHERE id = $id")->fetch_assoc();
if (!$imovel) { die("<div class='container mt-5 alert alert-danger'>Imóvel não encontrado.</div>"); }

$dono_id = $imovel['dono_id']; 
$usuario_logado_id = $_SESSION['usuario_id'] ?? 0; 

// 1. Busca Datas Reservadas (Para o Calendário)
$reservas_result = $conn->query("SELECT data_inicio, data_fim FROM reservas WHERE imovel_id = $id AND status = 'Confirmada'");
$datas_reservadas = [];
while ($res = $reservas_result->fetch_assoc()) {
    $dt = new DateTime($res['data_inicio']);
    $end = new DateTime($res['data_fim']);
    while ($dt < $end) { $datas_reservadas[] = $dt->format('Y-m-d'); $dt->modify('+1 day'); }
}
$datas_json = json_encode($datas_reservadas);

// 2. Busca Mensagens (Chat)
$mensagens = [];
if ($usuario_logado_id != 0) {
    $sql_chat = "SELECT m.*, u.nome as remetente_nome FROM mensagens m JOIN usuarios u ON m.remetente_id = u.id 
                 WHERE m.imovel_id = $id AND ((m.remetente_id = $usuario_logado_id AND m.destinatario_id = $dono_id) 
                 OR (m.remetente_id = $dono_id AND m.destinatario_id = $usuario_logado_id)) ORDER BY m.data_envio ASC";
    $mensagens = $conn->query($sql_chat)->fetch_all(MYSQLI_ASSOC);
}

// 3. Busca Avaliações
$avaliacoes = $conn->query("SELECT a.*, u.nome FROM avaliacoes a JOIN usuarios u ON a.usuario_id = u.id WHERE imovel_id = $id ORDER BY data_avaliacao DESC");
$stats = $conn->query("SELECT AVG(nota) as media, COUNT(id) as total FROM avaliacoes WHERE imovel_id = $id")->fetch_assoc();
$media_nota = number_format($stats['media'] ?? 0, 1);
?>

<div class="container mt-4">
    <?php if (isset($_GET['erro'])): ?>
        <div class="alert alert-danger"><?php echo htmlspecialchars($_GET['erro']); ?></div>
    <?php endif; ?>
    <?php if (isset($_GET['sucesso'])): ?>
        <div class="alert alert-success">Ação realizada com sucesso!</div>
    <?php endif; ?>

    <div class="row">
        <div class="col-md-8">
            <img src="uploads/<?php echo $imovel['imagem']; ?>" class="img-fluid rounded mb-3 w-100" style="height: 400px; object-fit:cover;">
            <h1><?php echo $imovel['titulo']; ?></h1>
            <p class="text-muted"><?php echo $imovel['cidade']; ?></p>
            <p><?php echo nl2br(htmlspecialchars($imovel['descricao'] ?? '')); ?></p>
            <hr>

            <div class="card mb-4">
                <div class="card-header fw-bold">Chat com Anfitrião</div>
                <div class="card-body" style="max-height: 300px; overflow-y: auto;">
                <?php if ($usuario_logado_id == 0): ?>
                    <p class="text-center"><a href="login.php">Faça login</a> para conversar.</p>
                <?php elseif ($usuario_logado_id == $dono_id): ?>
                    <p class="text-center">Você é o dono. Use o <a href="painel.php">Painel</a> para responder.</p>
                <?php else: ?>
                    <?php if (empty($mensagens)) echo "<p class='text-muted text-center'>Inicie a conversa!</p>"; ?>
                    <?php foreach($mensagens as $msg): 
                        $eu = ($msg['remetente_id'] == $usuario_logado_id);
                    ?>
                        <div class="d-flex mb-2 <?php echo $eu ? 'justify-content-end' : 'justify-content-start'; ?>">
                            <div class="p-2 rounded <?php echo $eu ? 'bg-primary text-white' : 'bg-light'; ?>" style="max-width: 75%;">
                                <small class="d-block fw-bold"><?php echo $eu ? 'Você' : $msg['remetente_nome']; ?></small>
                                <?php echo htmlspecialchars($msg['texto']); ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                <div class="card-footer">
                    <form action="enviar_mensagem.php" method="POST" class="d-flex">
                        <input type="hidden" name="imovel_id" value="<?php echo $id; ?>">
                        <input type="hidden" name="destinatario_id" value="<?php echo $dono_id; ?>">
                        <input type="text" name="mensagem" class="form-control me-2" required placeholder="Digite aqui...">
                        <button class="btn btn-primary">Enviar</button>
                    </form>
                </div>
                <?php endif; ?>
            </div>

            <h3>Avaliações (<?php echo $stats['total']; ?>) - ⭐ <?php echo $media_nota; ?></h3>
            <?php if ($usuario_logado_id != 0 && $usuario_logado_id != $dono_id): ?>
                <form action="enviar_avaliacao.php" method="POST" class="border p-3 rounded mb-4">
                    <h5>Avaliar Imóvel</h5>
                    <input type="hidden" name="imovel_id" value="<?php echo $id; ?>">
                    <select name="nota" class="form-select mb-2" required>
                        <option value="5">5 - Excelente</option><option value="4">4 - Muito Bom</option>
                        <option value="3">3 - Bom</option><option value="2">2 - Regular</option><option value="1">1 - Ruim</option>
                    </select>
                    <textarea name="comentario" class="form-control mb-2" placeholder="Comentário..."></textarea>
                    <button class="btn btn-danger">Enviar Avaliação</button>
                </form>
            <?php endif; ?>
            
            <div class="list-group">
                <?php while($av = $avaliacoes->fetch_assoc()): ?>
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between">
                            <h6 class="fw-bold"><?php echo $av['nome']; ?></h6>
                            <span class="text-warning">⭐ <?php echo $av['nota']; ?></span>
                        </div>
                        <p class="mb-0"><?php echo htmlspecialchars($av['comentario']); ?></p>
                    </div>
                <?php endwhile; ?>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card p-3 sticky-top" style="top: 20px;">
                <h3>R$ <?php echo number_format($imovel['preco_diaria'], 2, ',', '.'); ?> / noite</h3>
                <form action="processar_pagamento.php" method="POST">
                    <input type="hidden" name="imovel_id" value="<?php echo $id; ?>">
                    <input type="hidden" id="preco_diaria" value="<?php echo $imovel['preco_diaria']; ?>">
                    
                    <div class="mb-2">
                        <label>Check-in</label>
                        <input type="text" id="checkin" name="checkin" class="form-control" readonly required>
                    </div>
                    <div class="mb-2">
                        <label>Check-out</label>
                        <input type="text" id="checkout" name="checkout" class="form-control" readonly required>
                    </div>
                    <div class="mb-2">
                        <label>Pagamento</label>
                        <select name="metodo" id="metodo" class="form-select">
                            <option value="cartao">Cartão</option>
                            <option value="pix">PIX (10% OFF)</option>
                            <option value="boleto">Boleto</option>
                        </select>
                    </div>

                    <div id="card-info">
                        <input type="text" name="cartao_numero" class="form-control mb-2" placeholder="Num Cartão">
                        <div class="row">
                            <div class="col"><input type="text" name="cartao_validade" class="form-control" placeholder="MM/AA"></div>
                            <div class="col"><input type="text" name="cartao_cvv" class="form-control" placeholder="CVV"></div>
                        </div>
                    </div>

                    <div class="mt-3 pt-2 border-top">
                        <p>Total: <strong id="total_display">R$ 0,00</strong></p>
                    </div>
                    <button class="btn btn-primary w-100 mt-2">Reservar</button>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
$(function() {
    const disabledDates = <?php echo $datas_json; ?>;
    function disableDates(date) {
        var string = $.datepicker.formatDate('yy-mm-dd', date);
        return [disabledDates.indexOf(string) == -1];
    }

    $("#checkin").datepicker({ 
        minDate: 0, dateFormat: 'yy-mm-dd', beforeShowDay: disableDates,
        onSelect: function(date) {
            var dt = new Date(date); dt.setDate(dt.getDate() + 1);
            $("#checkout").datepicker("option", "minDate", dt);
            calc();
        }
    });
    $("#checkout").datepicker({ 
        minDate: 1, dateFormat: 'yy-mm-dd', beforeShowDay: disableDates,
        onSelect: calc
    });
    
    $("#metodo").change(calc);

    function calc() {
        var d1 = $("#checkin").datepicker('getDate');
        var d2 = $("#checkout").datepicker('getDate');
        var price = parseFloat($("#preco_diaria").val());
        var metodo = $("#metodo").val();
        
        if(metodo == 'cartao') $("#card-info").show(); else $("#card-info").hide();

        if (d1 && d2 && d2 > d1) {
            var days = (d2 - d1) / (1000 * 60 * 60 * 24);
            var total = days * price;
            if(metodo == 'pix') total = total * 0.9;
            $("#total_display").text("R$ " + total.toFixed(2).replace('.', ','));
        }
    }
});
</script>
<?php include 'footer.php'; ?>