<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home Sweet Home - Encontre seu lar</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    
    <link rel="stylesheet" href="//code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.js"></script>

   <style>
    /* ... Seus estilos existentes (botão vermelho, etc) ... */

    /* CORREÇÃO DO CALENDÁRIO (DATEPICKER) */
    #ui-datepicker-div {
        z-index: 9999 !important; /* Força o calendário a ficar acima de tudo */
    }
    
    .ui-datepicker {
        background-color: #ffffff; /* Fundo branco para não ficar transparente */
        border: 1px solid #ddd;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2); /* Sombra para destacar */
        padding: 5px;
        border-radius: 5px;
    }

    /* Ajuste dos botões do calendário */
    .ui-datepicker-header {
        background: #f8f9fa;
        border-bottom: 1px solid #ddd;
    }
</style>
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom">
  <div class="container">
    <a class="navbar-brand text-danger fw-bold" href="index.php">Home Sweet Home</a>
    
    <div class="d-flex align-items-center">
        <?php if (isset($_SESSION['usuario_id'])): ?>
            <a href="minhas_reservas.php" class="btn btn-outline-dark me-2 d-none d-md-block">Minhas Reservas</a>
            <a href="minhas_viagens.php" class="btn btn-outline-dark me-2 d-none d-md-block">Minhas Viagens</a>
            <a href="painel.php" class="btn btn-outline-dark me-3 d-none d-md-block">Meu Painel</a>
            <a href="cadastrar_imovel.php" class="btn btn-success me-3">Anuncie seu espaço</a>
            <span class="me-3">Olá, <strong><?php echo $_SESSION['usuario_nome']; ?></strong></span>
            <a href="logout.php" class="btn btn-sm btn-danger">Sair</a>
        <?php else: ?>
            <a href="cadastrar_imovel.php" class="btn btn-outline-dark me-3 d-none d-md-block">Anuncie seu espaço</a>
            <a href="login.php" class="btn btn-dark">Entrar</a>
        <?php endif; ?>
    </div>
  </div>
</nav>