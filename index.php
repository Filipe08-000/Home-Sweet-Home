<?php
include 'conexao.php';
include 'header.php';

$sql = "SELECT * FROM imoveis ORDER BY id DESC";
$result = $conn->query($sql);
?>

<div class="hero text-center bg-danger text-white py-5 mb-4">
    <div class="container">
        <h1 class="display-4 fw-bold">Home Sweet Home</h1>
        <p class="lead">Encontre o lugar perfeito para sua próxima estadia.</p>
    </div>
</div>

<div class="container">
    <div class="row">
        <?php if ($result->num_rows > 0): ?>
            <?php while($row = $result->fetch_assoc()): ?>
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm border-0">
                        <img src="uploads/<?php echo $row['imagem']; ?>" class="card-img-top" alt="Imagem do Imóvel" style="height: 220px; object-fit: cover;">
                        <div class="card-body">
                            <h5 class="card-title fw-bold"><?php echo htmlspecialchars($row['titulo']); ?></h5>
                            <p class="card-text text-muted small">
                                <i class="bi bi-geo-alt-fill"></i> <?php echo htmlspecialchars($row['cidade']); ?>
                            </p>
                            <p class="card-text fw-bold text-danger fs-5">
                                R$ <?php echo number_format($row['preco_diaria'], 2, ',', '.'); ?> <span class="text-muted fs-6 fw-normal">/ noite</span>
                            </p>
                            <a href="detalhes.php?id=<?php echo $row['id']; ?>" class="btn btn-danger w-100">Ver Detalhes</a>
                        </div>
                    </div>
                </div>
            <?php endwhile; ?>
        <?php else: ?>
            <div class="col-12 text-center">
                <p class="text-muted">Nenhum imóvel cadastrado ainda.</p>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php include 'footer.php'; ?>