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
        res.json(recipe);
    }
    catch (err) {
        res.status(500).json({ message: 'Erro ao buscar recipe', error: err });
    }
}));
app.get('/recipes/:title', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.params;
    try {
        const recipe = yield connection('recipes').where({ title }).first();
        if (!recipe) {
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
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
//# sourceMappingURL=index.js.map