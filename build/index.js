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
const generatedId_1 = require("./generatedId");
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
        const recipes = yield connection.from('recipes');
        if (recipes.length === 0) {
            res.status(404).json({ message: "no recipes found" });
            return;
        }
        res.status(200).json(recipes);
    }
    catch (err) {
        res.status(500).json({ message: 'Erro ao buscar recipes', error: err });
    }
}));
app.get('/recipes/:title', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.params;
    if (!title) {
        res.status(400).json({ message: "Title is required" });
    }
    try {
        const recipe = yield connection('RECIPES').where('TITLE', 'ILIKE', `%${title}%`);
        if (recipe.length === 0) {
            res.status(404).json("recipe not found");
            return;
        }
        else {
            res.json(recipe);
        }
    }
    catch (err) {
        res.status(500).json({ message: 'Erro ao buscar recipe', error: err });
    }
}));
app.delete('/recipes/:id_recipe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_recipe } = req.params;
    if (!id_recipe) {
        res.status(404).json({ message: "Id is required" });
    }
    try {
        const recipe = yield connection('recipes')
            .where('id_recipe', id_recipe).first();
        if (!recipe) {
            res.status(404).json({ message: "Recipe not found" });
            return;
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
    const gerarID = (0, generatedId_1.generateId)();
    if (!title || !description || !prep_time || !user_id || !modo_preparo) {
        res.status(404).json({ message: "Campo obrigatório" });
        return;
    }
    try {
        const userExists = yield connection('users').where('id_user', user_id).first();
        if (!userExists) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
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
        res.status(500).json({ message: 'An unexpected error occurred' });
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
app.get('/recipes/users/:username', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    if (!username || typeof username !== 'string') {
        res.status(400).json({ message: "Invalid username parameter." });
        return;
    }
    try {
        const recipes = yield connection('recipes')
            .join('users', 'recipes.user_id', '=', 'users.id_user')
            .where('users.name_user', username)
            .select('recipes.*');
        if (recipes.length === 0) {
            res.status(404).json({ message: "No recipes found for this user." });
            return;
        }
        res.status(200).json(recipes);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching recipes for user' });
    }
}));
app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield connection.select('*').from('users');
        if (users.length === 0) {
            res.status(400).json({ message: 'no users found' });
            return;
        }
        res.json(users);
    }
    catch (error) {
        res.status(404).json({ message: 'users not found' });
    }
}));
app.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name_user, sobrenome, age, gender } = req.body;
    const gerarID = (0, generatedId_1.generateId)();
    if (!name_user || typeof name_user !== 'string' || name_user.length > 50) {
        res.status(400).json({ message: "Invalid name_user" });
        return;
    }
    if (!sobrenome || typeof sobrenome !== 'string' || sobrenome.length > 50) {
        res.status(400).json({ message: "Invalid sobrenome" });
        return;
    }
    if (typeof age !== 'number' || age <= 0) {
        res.status(400).json({ message: "Invalid age" });
        return;
    }
    if (!gender || typeof gender !== 'string' || gender.length > 12) {
        res.status(400).json({ message: "Invalid gender" });
        return;
    }
    try {
        yield connection('users').insert({
            id_user: gerarID,
            name_user,
            sobrenome,
            age,
            gender
        });
        res.status(201).json('user created sucessfully!');
    }
    catch (error) {
        res.status(500).json({ message: 'something is wrong' });
    }
}));
app.delete('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        res.status(404).json({ message: "User ID is required." });
        return;
    }
    try {
        const userExists = yield connection('users').where('id_user', id).first();
        if (!userExists) {
            res.status(404).json({ message: "user not found" });
            return;
        }
        yield connection('users')
            .where('id_user', id)
            .del();
        res.status(200).json({ message: "user deleted sucessfully!" });
    }
    catch (error) {
        res.status(500).json({ message: "An error occurred while deleting the user." });
        return;
    }
}));
app.put('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name_user, sobrenome, age, gender } = req.body;
    if (!id) {
        res.status(404).json({ message: "User ID is required." });
        return;
    }
    if (!name_user && !sobrenome && !age && !gender) {
        res.status(400).json({ message: "At least one field is required for update." });
        return;
    }
    if (name_user && typeof name_user !== 'string') {
        res.status(400).json({ message: "name_user must be a string." });
        return;
    }
    if (sobrenome && typeof sobrenome !== 'string') {
        res.status(400).json({ message: "sobrenome must be a string." });
        return;
    }
    if (age && (typeof age !== 'number' || age <= 0)) {
        res.status(400).json({ message: "age must be a positive number." });
        return;
    }
    if (gender && typeof gender !== 'string') {
        res.status(400).json({ message: "gender must be a string." });
        return;
    }
    try {
        const userExsist = yield connection('users').where('id_user', id);
        if (!userExsist) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        yield connection('users').where('id_user', id).update({
            name_user,
            sobrenome,
            age,
            gender
        });
        res.status(200).json({ message: "User updated successfully!" });
    }
    catch (error) {
        res.status(400).json({ message: "An error occurred while updating the user." });
    }
}));
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
//# sourceMappingURL=index.js.map