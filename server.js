// const express = require('express');
const connection = require('./db/connections');
const inquirer = require('inquirer');
const cTable = require('console.table');
const mysql = require('mysql2');
// const PORT = process.env.PORT || 3001;
// const app = express();

// // Express middleware
// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());

// Database connect
connection.connect((error) => {
  if (error) throw error;
  promptUser();
});

// Prompt user
const promptUser = () => {
  inquirer
    .prompt([
      {
        name: 'choices',
        type: 'list',
        message: 'Select what you would like to do.',
        choices: [
          'View all Departments',
          'View all Roles',
          'View all Employees',
          'Add a Department',
          'Add a Role',
          'Add an Employee',
          'Update an employee role',
          // Update employee managers
          // View employees by manager
          // View employees by department
          // Delete departments, roles, employees
          // View combined salaries of a department
          'Exit',
        ],
      },
    ])
    .then((answers) => {
      const { choices } = answers;

      if (choices === 'View all Departments') {
        viewDepartments();
      }

      if (choices === 'View all Roles') {
        viewRoles();
      }

      if (choices === 'View all Employees') {
        viewEmployees();
      }

      if (choices === 'Add a Department') {
        addDepartment();
      }

      if (choices === 'Add a Role') {
        addRole();
      }

      if (choices === 'Add an Employee') {
        addEmployee();
      }

      if (choices === 'Update an employee role') {
        updateEmployeeRole();
      }

      if (choices === 'Exit') {
        connection.end();
      }
    });
};

// VIEW
viewDepartments = () => {
  const sql = `SELECT department.id AS id, department.department_name AS department FROM department `;
  connection /*.promise()*/
    .query(sql, (err, rows) => {
      if (err) throw err;
      console.table(rows);
    });

  promptUser();
};

viewRoles = () => {
  const sql = `SELECT role.id AS id, role.title AS title, role.salary AS salary FROM role `;
  connection /*.promise()*/
    .query(sql, (err, rows) => {
      if (err) throw err;
      console.table(rows);
    });

  promptUser();
};

viewEmployees = () => {
    const sql = `SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, employee.role_id AS role_id, employee.manager_id AS manager_id FROM employee `;
    connection/*.promise()*/.query(sql, (err, rows) => {
      if (err) throw (err);
      console.table(rows);
    });
  
    promptUser();
  };

// // Default response for any other request (Not Found)
// app.use((req, res) => {
//     res.status(404).end();
//   });

//   // Start server after DB connection
//   db.connect(err => {
//     if (err) throw err;
//     console.log('Database connected.');
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   });
