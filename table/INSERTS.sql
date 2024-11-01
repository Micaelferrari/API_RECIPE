
INSERT INTO USERS (ID_USER, NAME_USER, SOBRENOME, AGE, GENDER) VALUES
('U001', 'João', 'Silva', 25, 'Masculino'),
('U002', 'Maria', 'Oliveira', 30, 'Feminino'),
('U003', 'Pedro', 'Santos', 40, 'Masculino'),
('U004', 'Ana', 'Souza', 22, 'Feminino'),
('U005', 'Carlos', 'Pereira', 35, 'Masculino');

-- Inserts para a tabela RECIPES
INSERT INTO RECIPES (ID_RECIPE, TITLE, DESCRIPTION, PREP_TIME, USER_ID, MODO_PREPARO) VALUES
('R001', 'Bolo de Cenoura', 'Um bolo delicioso de cenoura com cobertura de chocolate.', '30 min', 'U001', 'Misture todos os ingredientes e asse por 25 minutos.'),
('R002', 'Sopa de Legumes', 'Sopa nutritiva com diversos legumes.', '45 min', 'U002', 'Cozinhe os legumes em água e tempere a gosto.'),
('R003', 'Macarrão ao Alho', 'Macarrão frito com alho e azeite.', '15 min', 'U003', 'Cozinhe o macarrão e frite com alho no azeite.'),
('R004', 'Frango Grelhado', 'Frango marinado e grelhado.', '20 min', 'U004', 'Marinar o frango e grelhar até dourar.'),
('R005', 'Salada de Frutas', 'Salada com frutas variadas.', '10 min', 'U005', 'Misture todas as frutas em uma tigela.');

-- Inserts para a tabela INGREDIENTS
INSERT INTO INGREDIENTS (ID_INGREDIENT, NAME_INGREDIENT, TYPE_INGREDIENT) VALUES
('I001', 'Cenoura', 'Vegetal'),
('I002', 'Farinha de Trigo', 'Grão'),
('I003', 'Ovo', 'Animal'),
('I004', 'Leite', 'Laticínio'),
('I005', 'Chocolate', 'Aditivo'),
('I006', 'Macarrão', 'Grão'),
('I007', 'Manjericão', 'Erva'),
('I008', 'Fruta Variada', 'Fruta'),
('I009', 'Frango', 'Carne'),
('I010', 'Creme de Leite', 'Laticínio');

-- Inserts para a tabela RECIPE_INGREDIENT
INSERT INTO RECIPE_INGREDIENT (ID_RECIPE, ID_INGREDIENT, QUANTITY, NOME_INGREDIENT) VALUES
('R001', 'I001', 2, 'Cenoura'),
('R001', 'I005', 1, 'Chocolate'),
('R002', 'I002', 1, 'Farinha de Trigo'),
('R002', 'I004', 1, 'Leite'),
('R003', 'I006', 1, 'Macarrão'),
('R003', 'I003', 2, 'Ovo'),
('R004', 'I009', 1, 'Frango'),
('R005', 'I008', 3, 'Fruta Variada'),
('R005', 'I007', 1, 'Manjericão');