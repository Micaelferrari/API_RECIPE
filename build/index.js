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
            throw new Error("No recipes found");
        }
        res.status(200).json(recipes);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'An unexpected error occurred' });
    }
}));
app.get('/recipes/:title', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.params;
    if (!title) {
        throw new Error("Title is required");
    }
    try {
        const recipe = yield connection('recipes').where('title', 'ILIKE', `%${title}%`);
        if (recipe.length === 0) {
            throw new Error("Recipe not found");
        }
        res.status(200).json(recipe);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching recipe' });
    }
}));
app.delete('/recipes/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        throw new Error("Recipe ID is required");
    }
    try {
        const recipe = yield connection('recipes').where('id_recipe', id).first();
        if (!recipe) {
            throw new Error("Recipe not found");
        }
        yield connection('recipes').where('id_recipe', id).del();
        res.status(200).json({ message: 'Recipe deleted successfully!' });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error deleting recipe' });
    }
}));
app.post('/recipes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, prep_time, user_id, modo_preparo } = req.body;
    const gerarID = (0, generatedId_1.generateId)();
    if (!title || !description || !prep_time || !user_id || !modo_preparo) {
        throw new Error("All fields are required");
    }
    try {
        const userExists = yield connection('users').where('id_user', user_id).first();
        if (!userExists) {
            throw new Error('User not found');
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
        res.status(500).json({ message: error.message || 'An unexpected error occurred' });
    }
}));
app.get('/recipes/ingredients/:ingredient', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ingredient } = req.params;
    if (typeof ingredient !== 'string' || ingredient.trim() === '') {
        throw new Error("Invalid ingredient");
    }
    try {
        const recipes = yield connection('recipe_ingredient')
            .join('recipes', 'recipe_ingredient.id_recipe', 'recipes.id_recipe')
            .join('ingredients', 'recipe_ingredient.id_ingredient', 'ingredients.id_ingredient')
            .where('ingredients.name_ingredient', 'ILIKE', `%${ingredient}%`)
            .select('recipes.*');
        if (recipes.length === 0) {
            throw new Error("No recipes found with the specified ingredient.");
        }
        res.status(200).json(recipes);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching recipes by ingredient' });
    }
}));
app.get('/recipes/users/:username', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    if (!username || typeof username !== 'string') {
        throw new Error("Invalid username parameter.");
    }
    try {
        const user = yield connection('users').where('name_user', username).first();
        if (!user) {
            throw new Error("User not found");
        }
        const recipes = yield connection('recipes')
            .where('user_id', user.id_user)
            .select('recipes.*');
        if (recipes.length === 0) {
            throw new Error("No recipes found for this user.");
        }
        res.status(200).json(recipes);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching recipes for user' });
    }
}));
app.patch('/recipes/:id_recipe/ingredients/:id_ingredient', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_recipe, id_ingredient } = req.params;
    const { quantity } = req.body;
    if (!id_recipe || !id_ingredient) {
        throw new Error("Recipe ID and Ingredient ID are required.");
    }
    try {
        const recipeExists = yield connection('recipes').where('id_recipe', id_recipe).first();
        const ingredientExists = yield connection('ingredients').where('id_ingredient', id_ingredient).first();
        if (!recipeExists) {
            throw new Error("Recipe not found.");
        }
        if (!ingredientExists) {
            throw new Error("Ingredient not found.");
        }
        yield connection('recipe_ingredient')
            .where({ id_recipe, id_ingredient })
            .update({ quantity });
        res.status(200).json({ message: "Ingredient updated successfully!" });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'An error occurred while updating the ingredient.' });
    }
}));
app.put('/recipes/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, description, prep_time, user_id, modo_preparo } = req.body;
    if (!id) {
        res.status(400).json({ message: "Recipe ID is required." });
        return;
    }
    if (!title || !description || !prep_time || !user_id || !modo_preparo) {
        res.status(400).json({ message: "All fields are required." });
        return;
    }
    try {
        const recipeExists = yield connection('recipes').where('id_recipe', id).first();
        if (!recipeExists) {
            throw new Error("Recipe not found.");
        }
        yield connection('recipes').where('id_recipe', id).update({
            title,
            description,
            prep_time,
            user_id,
            modo_preparo
        });
        res.status(200).json({ message: "Recipe updated successfully!" });
    }
    catch (error) {
        res.status(500).json({ message: "An error occurred while updating the recipe.", error: error.message });
    }
}));
app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield connection.select('*').from('users');
        if (users.length === 0) {
            throw new Error('No users found');
        }
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching users' });
    }
}));
app.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name_user, sobrenome, age, gender } = req.body;
    const gerarID = (0, generatedId_1.generateId)();
    if (!name_user || typeof name_user !== 'string' || name_user.length > 50) {
        throw new Error("Invalid name_user");
    }
    if (!sobrenome || typeof sobrenome !== 'string' || sobrenome.length > 50) {
        throw new Error("Invalid sobrenome");
    }
    if (typeof age !== 'number' || age <= 0) {
        throw new Error("Invalid age");
    }
    if (!gender || typeof gender !== 'string' || gender.length > 12) {
        throw new Error("Invalid gender");
    }
    try {
        yield connection('users').insert({
            id_user: gerarID,
            name_user,
            sobrenome,
            age,
            gender
        });
        res.status(201).json('User created successfully!');
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'An unexpected error occurred' });
    }
}));
app.delete('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        throw new Error("User ID is required");
    }
    try {
        const userExists = yield connection('users').where('id_user', id).first();
        if (!userExists) {
            throw new Error("User not found");
        }
        yield connection('users').where('id_user', id).del();
        res.status(200).json({ message: 'User deleted successfully!' });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error deleting user' });
    }
}));
app.put('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name_user, sobrenome, age, gender } = req.body;
    try {
        const userExists = yield connection('users').where('id_user', id).first();
        if (!userExists) {
            throw new Error("User not found");
        }
        yield connection('users')
            .where('id_user', id)
            .update({ name_user, sobrenome, age, gender });
        res.status(200).json({ message: 'User updated successfully!' });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error updating user' });
    }
}));
app.get('/ingredients', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ingredients = yield connection('ingredients');
        if (ingredients.length === 0) {
            throw new Error('No ingredients found');
        }
        res.status(200).json(ingredients);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching ingredients' });
    }
}));
app.post('/ingredients', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name_ingredient, type_ingredient } = req.body;
    const gerarID = (0, generatedId_1.generateId)();
    if (!name_ingredient || typeof name_ingredient !== 'string') {
        throw new Error("Invalid name_ingredient");
    }
    if (!type_ingredient || typeof type_ingredient !== 'string') {
        throw new Error("Invalid type_ingredient");
    }
    try {
        yield connection('ingredients').insert({
            id_ingredient: gerarID,
            name_ingredient,
            type_ingredient
        });
        res.status(201).json("Ingredient created successfully!");
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'An unexpected error occurred' });
    }
}));
app.patch('/ingredients/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name_ingredient, type_ingredient } = req.body;
    try {
        const ingredientExists = yield connection('ingredients').where('id_ingredient', id).first();
        if (!ingredientExists) {
            throw new Error("Ingredient not found.");
        }
        yield connection('ingredients').where('id_ingredient', id).update({ name_ingredient, type_ingredient });
        res.status(200).json({ message: "Ingredient updated successfully!" });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error updating ingredient' });
    }
}));
app.delete('/ingredients/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        throw new Error("Ingredient ID is required");
    }
    try {
        const ingredientExists = yield connection('ingredients').where('id_ingredient', id).first();
        if (!ingredientExists) {
            throw new Error("Ingredient not found.");
        }
        yield connection('ingredients').where('id_ingredient', id).del();
        res.status(200).json({ message: "Ingredient deleted successfully!" });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error deleting ingredient' });
    }
}));
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
//# sourceMappingURL=index.js.map