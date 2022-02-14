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
  const sql = `SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, role.title AS role_title, 
                department.department_name AS department, role.salary AS salary, employee.manager_id as manager
                FROM employee, role, department
                WHERE department.id = role.department_id
                AND role.id = employee.role_id`
                // AND employee.manager_id = employee.first_name`
  connection /*.promise()*/
    .query(sql, (err, rows) => {
      if (err) throw err;
      console.table(rows);
    });

  promptUser();
};

// ADD
addEmployee = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: 'Please enter the first name of the employee:',
      validate: (addFirstName) => {
        if (addFirstName) {
          return true;
        } else {
          console.log('Please enter the first name of the employee:');
          return false;
        }
      },
    },
    {
      type: 'input',
      name: 'lastName',
      message: 'Please enter the last name of the employee:',
      validate: (addLastName) => {
        if (addLastName) {
          return true;
        } else {
          console.log('Please enter the last name of the employee:');
          return false;
        }
      },
    },
  ])
  .then(answer => {
      const newEmployee = [answer.firstName, answer.lastName];
      const roleSQL = `Select role.id, role.title FROM role`;
      connection.query(roleSQL, (error, data) => {
          if (error) throw error;
          const roles = data.map(({id, title}) => ({name: title, value: id}));
          inquirer.prompt([
              {
                type: 'list',
                name: 'role',
                message: "What is the employee's role?",
                choices: roles
              }
            ])
            .then(roleAnswer => {
                const role = roleAnswer.role;
                newEmployee.push(role);
                const managerSQL = `SELECT * FROM employee`;
                connection.query(managerSQL, (error, data) => {
                    if(error) throw error;
                    const managers = data.map(({id, first_name, last_name}) => ({name: first_name + " " + last_name, value: id}));
                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'manager',
                            message: "Who is the employee's manager?",
                            choices: managers
                        }
                    ])
                    .then(managerChoice => {
                        const manager = managerChoice.role;
                        newEmployee.push(manager);
                        const sql = `INSERT INTO employee(first_name, last_name, role_id, manager_id)
                                    VALUES(?, ?, ?, ?)`;
                        connection.query(sql, newEmployee, (error) => {
                            if (error) throw error;
                            viewEmployees();
                        });
                    });
                });
            });
      });
  });
};

addRole = () => {};
addDepartment = () => {};

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
