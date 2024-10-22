"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const connection = (0, knex_1.default)({
    client: 'pg',
    connection: {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '12345',
        database: 'api_recipe'
    }
});
connection.raw('SELECT 1')
    .then(() => {
    console.log('Conectado ao PostgreSQL com sucesso!');
})
    .catch((err) => {
    console.error('Erro ao conectar ao PostgreSQL:', err);
});
app.get('/recipes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recipe = yield connection.select('*').from('recipes');
        res.status(200).json(recipe);
    }
    catch (err) {
        res.status(500).json({ message: 'Erro ao buscar recipe', error: err });
    }
}));
app.get('/recipes/:title', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.params;
    try {
        const recipe = yield connection('RECIPES').where('TITLE', 'ILIKE', `%${title}%`);
        if (!recipe.length) {
            res.status(404).json("recipe not found");
        }
        else {
            res.json(recipe);
        }
    }
    catch (err) {
        res.status(500).json({ message: 'Erro ao buscar recipe', error: err });
    }
}));
app.get('/recipes/user/:username', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    try {
        const recipe = yield connection('recipes').join('USERS', 'RECIPE.USER_ID', 'USERS.ID_USERS').where('USERS.NAME_USER', username)
            .select('RECIPES');
        res.status(200).json(recipe);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao bsucar recipe' });
    }
}));
app.get('/recipes/ingredients/:ingredients', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ingredients } = req.params;
    const newIngredients = req.body;
    try {
        const recipes = yield connection('RECIPES')
            .where('INGREDIENTS', 'ILIKE', `%${ingredients}%`);
        res.status(200).json(recipes);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao buscar receitas por ingrediente', error: error.message });
    }
}));
app.delete('/recipes/:id_recipe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_recipe } = req.params;
    try {
        const recipe = yield connection('recipes')
            .where('id_recipe', id_recipe);
        if (!recipe) {
            res.status(404).json({ message: "recipe not found" });
        }
        yield connection('recipes')
            .where('id_recipe', id_recipe)
            .del();
        res.status(200).json({ message: 'Receita deletada com sucesso!' });
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao deletar a receita', error: error.message });
    }
}));
app.post('/recipes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, prep_time, user_id, modo_preparo } = req.body;
    const gerarID = Math.random();
    try {
        yield connection('recipes').insert({
            id_recipe: gerarID,
            title,
            description,
            prep_time,
            user_id,
            modo_preparo
        });
        res.status(201).json("Recipe created successfully!");
    }
    catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred', error: error.message });
    }
}));
app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield connection.select('*').from('users');
        res.json(users);
    }
    catch (error) {
        res.status(404).json({ message: 'users not found' });
    }
}));
app.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_user, name_user, sobrenome, age, gender } = req.body;
    if (!id_user || !name_user || !sobrenome || !age || !gender) {
        res.send("campo obrigatório");
    }
    try {
        yield connection('users').insert({
            id_user,
            name_user,
            sobrenome,
            age,
            gender
        });
        res.status(201).json('users created sucessfully!');
    }
    catch (error) {
        res.status(500).json({ message: 'something is wrong' });
    }
}));
app.delete('/usurs');
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
//# sourceMappingURL=index.js.map