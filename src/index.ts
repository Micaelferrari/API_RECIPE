  import knex from 'knex';
  import express from 'express';
  import cors from 'cors';
  import { Request, Response } from 'express';

  //servidor
  const app = express();
  app.use(express.json());
  app.use(cors());


  const connection = knex({//estabelece conexão com o banco de dados
    client: 'pg',
    connection: {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: '12345',
      database: 'api_recipe'
    }
  });

  // Testando a conexão
  connection.raw('SELECT 1')
    .then(() => {
      console.log('Conectado ao PostgreSQL com sucesso!');
    })
    .catch((err: Error) => {
      console.error('Erro ao conectar ao PostgreSQL:', err);
    });

  // Rota para obter todas as recipe
  app.get('/recipes', async (req: Request, res: Response) => {
    try {
      const recipe = await connection.select('*').from('recipes'); 
      res.json(recipe);
    } catch (err) {
      res.status(500).json({ message: 'Erro ao buscar recipe', error: err });
    }
  });

  // Rota para obter receita específica
  app.get('/recipes/:title', async (req: Request, res: Response) => {
    const {title} = req.params
    try {
        const recipe = await connection('recipes').where({title}).first()
      if(!recipe){
        res.status(404).json("recipe not found")
      }
      else{
        res.json(recipe)
      }
    } catch (err) {
      res.status(500).json({ message: 'Erro ao buscar recipe', error: err });
    }
  });




  // Configurando o servidor para escutar na porta 3000
  app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
  });
