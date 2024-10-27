import knex, { Knex } from 'knex';
import express, { json } from 'express';
import cors from 'cors';
import { Request, Response } from 'express';
import { generateId } from './generatedId';

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
//verifica se existe receitas(ok)
app.get('/recipes', async (req: Request, res: Response) : Promise<void> => {

  try {
    const recipes = await connection.from('recipes');

    if(recipes.length===0){
      res.status(404).json({message: "no recipes found"})
      return
    }
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar recipes', error: err });
  }
});

//BUSCAR RECEITAS COM TITULO ESPECÍFICO (ok)
//verificar se o title foi inserido(ok)
app.get('/recipes/:title', async (req: Request, res: Response) : Promise<void> => {
  const { title } = req.params

  if(!title){
    res.status(400).json({message: "Title is required"})
  }

  try {
    const recipe = await connection('RECIPES').where('TITLE', 'ILIKE', `%${title}%`)//LIKE

    if (recipe.length===0) {
      res.status(404).json("recipe not found")
      return
    }
    else {
      res.json(recipe)
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar recipe', error: err });
  }
});



// Rota para excluir receita por ID (ok)
//verificar se o id foi inserido(ok)
//verificar se a receita existe(ok)

app.delete('/recipes/:id_recipe', async (req: Request, res: Response): Promise<void> => {

  const { id_recipe } = req.params;

  if(!id_recipe){
    res.status(404).json({message: "Id is required"})
  }

  try {

    const recipe = await connection('recipes')
      .where('id_recipe', id_recipe).first();

    if (!recipe) {
      res.status(404).json({ message: "Recipe not found" })
      return
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
//* verificar se já existe user(ok)
//somente um usuário logado pode criar receita falta
//verificar se todos os campos foram inseridos(ok)

app.post('/recipes', async (req: Request, res: Response) : Promise<void> => {
  const { title, description, prep_time, user_id, modo_preparo } = req.body;
  const gerarID = generateId(); // Chamar a função para gerar um ID

if(!title || !description || !prep_time || !user_id || !modo_preparo){
  res.status(404).json({message: "Campo obrigatório"})
  return
}

  try {
    // Verifica se o user_id existe
    const userExists = await connection('users').where('id_user', user_id).first();

    if (!userExists) {
      res.status(404).json({ message: 'User not found' });
      return
    }

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
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

//------------------------------------------------------------------------------------------------------------------------------------------------------

// BUSCAR POR RECEITA QUE TENHA UM INGREDIENTE ESPECÍFICO
app.get('/recipes/ingredients/:ingredient', async (req: Request, res: Response): Promise<void> => {
  const { ingredient } = req.params;

  if (typeof ingredient !== 'string' || ingredient.trim() === '') {
      res.status(400).json({ message: "Invalid ingredient" });
      return;
  }

  try {
      const recipes = await connection('recipe_ingredient')
          .join('recipes', 'recipe_ingredient.id_recipe', 'recipes.id_recipe')
          .join('ingredients', 'recipe_ingredient.id_ingredient', 'ingredients.id_ingredient')
          .where('ingredients.name_ingredient', 'ILIKE', `%${ingredient}%`)
          .select('recipes.*');

      if (recipes.length === 0) {
          res.status(404).json({ message: "No recipes found with the specified ingredient." });
          return;
      }

      res.status(200).json(recipes);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching recipes by ingredient', error: (error as Error).message });
  }
});




//buscar receitas de um usuário específico
//verificar se o nome foi inserido e se ele é do tipo string(ok)
//verificar se existe receitas (ok)


app.get('/recipes/users/:username', async (req: Request, res: Response) => {
  const { username } = req.params;

  if (!username || typeof username !== 'string') {
    res.status(400).json({ message: "Invalid username parameter." });
    return;
  }

  try {
    const recipes = await connection('recipes')
      .join('users', 'recipes.user_id', '=', 'users.id_user')
      .where('users.name_user', username)
      .select('recipes.*');

    if (recipes.length === 0) {
      res.status(404).json({ message: "No recipes found for this user." });
      return;
    }

    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes for user'});
  }
});



//----------------------------------------------------------------------------------------------------------------------------------------------------


//ENDPOINTS DO USERS


//BUSCAR TODOS OS USUÁRIOS 
//verifica se existem usuários(ok)
app.get('/users', async (req: Request, res: Response): Promise<void> => {

  try {
    const users = await connection.select('*').from('users');

    if (users.length === 0) {
      res.status(400).json({ message: 'no users found' })
      return
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ message: 'users not found' })
  }
})

//CRIAR UM USUÁRIO (ok)
//verifica se os campos estão preenchidos e seguem o padrão das tabelas (ok)
app.post('/users', async (req: Request, res: Response): Promise<void> => {
  const { name_user, sobrenome, age, gender } = req.body;

  const gerarID = generateId();

  
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
    await connection('users').insert({
      id_user: gerarID,
      name_user,
      sobrenome,
      age,
      gender
    })

    res.status(201).json('user created sucessfully!')
  } catch (error) {
    res.status(500).json({ message: 'something is wrong' })
  }

});


//DELETAR UM USUÁRIO
//id inserido (ok)
//se o usuário existe(ok)

app.delete('/users/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;


  if (!id) {
    res.status(404).json({ message: "User ID is required." })
    return
  }

  try {

    const userExists = await connection('users').where('id_user', id).first()

    if (!userExists) {
      res.status(404).json({ message: "user not found" })
      return
    }

    await connection('users')
      .where('id_user', id)
      .del();

    res.status(200).json({ message: "user deleted sucessfully!" })
  }
  catch (error) {
    res.status(500).json({ message: "An error occurred while deleting the user." });
    return
  }

});


//atualizar um usuário
//verificar id(ok)
//verificar itens de atualização e seus tipos(ok)
//verificar se o usuários existe no banco de dados(ok)
app.put('/users/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const { name_user, sobrenome, age, gender } = req.body

  if (!id) {
    res.status(404).json({ message: "User ID is required." })
    return
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

    const userExsist = await connection('users').where('id_user', id)

    if (!userExsist) {
      res.status(404).json({ message: "User not found." })
      return
    }

    await connection('users').where('id_user', id).update({
      name_user,
      sobrenome,
      age,
      gender
    })

    res.status(200).json({ message: "User updated successfully!" })

  } catch (error) {
    res.status(400).json({ message: "An error occurred while updating the user." })
  }

})

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//ENDPOINT DOS INGREDIENTES
app.get('/ingredients', async (req: Request, res: Response): Promise<void> => {

  try{

    const ingredients = await connection.from('ingredients').select('*'); 

    if(ingredients.length === 0){
      res.status(404).json({message: " no ingredients found"})
      return
    }

    res.status(200).json(ingredients)
  }
  catch(error){
    res.status(404).json({message: "Error fetching ingredients"})
  }
})




//criar receita
//verificar se existe o nome e o type e se estão de acordo cmom o que foi pedido
app.post('/ingredients', async (req: Request, res: Response): Promise<void> => {
  const { name_ingredient, type_ingredient } = req.body;

  if (!name_ingredient || typeof name_ingredient !== 'string' || name_ingredient.length > 50) {
      res.status(400).json({ message: "Invalid name" });
      return;
  }

  if (!type_ingredient || typeof type_ingredient !== 'string' || type_ingredient.length > 20) {
      res.status(400).json({ message: "Invalid type" });
      return;
  }

  try {
      const gerarID = generateId();  

      await connection('ingredients').insert({
          id_ingredient: gerarID,
          name_ingredient,
          type_ingredient
      });

      res.status(201).json('Ingredient created successfully!');
  } catch (error) {
      res.status(500).json({ message: 'An unexpected error occurred' });
  }
});



// Configurando o servidor para escutar na porta 3000
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
//


