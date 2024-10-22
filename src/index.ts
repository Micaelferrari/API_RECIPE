import knex, { Knex } from 'knex';
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

//BUSCAR TODAS AS RECEITAS (ok) 
app.get('/recipes', async (req: Request, res: Response) => {
  try {
    const recipe = await connection.select('*').from('recipes');
    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar recipe', error: err });
  }
});

//BUSCAR RECEITAS COM TITULO ESPECÍFICO (ok)
app.get('/recipes/:title', async (req: Request, res: Response) => {
  const { title } = req.params
  try {
    const recipe = await connection('RECIPES').where('TITLE', 'ILIKE', `%${title}%`)//LIKE

    if (!recipe.length) {
      res.status(404).json("recipe not found")
    }
    else {
      res.json(recipe)
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar recipe', error: err });
  }
});


//preciso de ajuda, não sei usar o join
app.get('/recipes/user/:username', async (req: Request, res: Response) => {
  const { username } = req.params
  try {
    const recipe = await connection('recipes').join('USERS', 'RECIPE.USER_ID', 'USERS.ID_USERS').where('USERS.NAME_USER', username)
      .select('RECIPES')

    res.status(200).json(recipe)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao bsucar recipe' })
  }
})


//BUSCAR POR RECEITA QUE TENHA UM INGREDIENTE ESPECÍFICO
//PROVÁVELMENRTE TEM QUE USAR O JOIN, AINDA NÃO SEI FAZER

app.get('/recipes/ingredients/:ingredients', async (req: Request, res: Response) => {
  const { ingredients } = req.params;
    const newIngredients = req.body;
  try {
    const recipes = await connection('RECIPES')
      .where('INGREDIENTS', 'ILIKE', `%${ingredients}%`);

    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar receitas por ingrediente', error: (error as Error).message });
  }
});


//TENHO QUE VERIFICAR O ID DA RECEITA PRA PODER EXCLUIR 
// Rota para excluir receita por ID (ok)
app.delete('/recipes/:id_recipe', async (req: Request, res: Response) => {
  const { id_recipe } = req.params;
  try {
    const recipe = await connection('recipes')
      .where('id_recipe', id_recipe)  
    if(!recipe){
      res.status(404).json({message: "recipe not found"})
    }

    //deleta
    await connection('recipes')
      .where('id_recipe', id_recipe)
      .del();

    res.status(200).json({ message: 'Receita deletada com sucesso!' });
  } catch (error) {
     res.status(500).json({ message: 'Erro ao deletar a receita', error: (error as Error).message });
  }
});



// CRIAR RECEITA (ok)
app.post('/recipes', async (req: Request, res: Response) => {
  const { title, description, prep_time, user_id, modo_preparo } = req.body;
  const gerarID = Math.random();
  try {
    await connection('recipes').insert({
      id_recipe: gerarID,
      title,
      description,
      prep_time,
      user_id,
      modo_preparo
    });

    res.status(201).json("Recipe created successfully!");
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred', error: (error as Error).message });
  }
});

//ENDPOINTS DO USERS


//BUSCAR TODOS OS USUÁRIOS (ok)
app.get('/users', async (req: Request, res: Response )=>{
  try{
    const users = await connection.select('*').from('users');
    res.json(users);
  }catch(error){
    res.status(404).json({message: 'users not found'})
  }
})

//CRIAR UM USUÁRIO (ok)
//tratar os erros

app.post('/users', async (req: Request, res: Response)=>{
  const { id_user, name_user, sobrenome, age, gender} = req.body;
  
  if(!id_user  || !name_user || !sobrenome || !age || !gender){
     res.status(500).json("campo obrigatório")
  }
  try {
    await connection('users').insert({
      id_user,
      name_user,
      sobrenome,
      age,
      gender
    })

   res.status(201).json('users created sucessfully!')
  } catch (error) {
   res.status(500).json({message: 'something is wrong'})
  }

})
//DELETAR UM USUÁRIO

app.delete('/usurs')


// Configurando o servidor para escutar na porta 3000
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
//