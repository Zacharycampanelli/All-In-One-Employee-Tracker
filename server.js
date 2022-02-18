// const express = require('express');
const connection = require('./db/connections');
const inquirer = require('inquirer');
const cTable = require('console.table');
const mysql = require('mysql2');
const { connect } = require('./db/connections');
const PromptUI = require('inquirer/lib/ui/prompt');
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
          'Update employee managers',
          'View employees by manager',
          'View employees by department',
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

      if (choices === 'Update employee managers') {
        updateManager();
      }

      if (choices === 'View employees by manager') {
        viewEmployeesByManager();
      }

      if (choices === 'View employees by department') {
        viewEmployeesByDepartment();
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

// viewEmployee = (id) => {
//   const sql = `SELECT * FROM employee WHERE employee.id = ${parseInt(id)}`;
//   connection /*.promise()*/
//     .query(sql, (err, rows) => {
//       if (err) throw err;
//       console.table(rows);
//     });
// };

viewEmployees = () => {
  const sql = `SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, role.title AS role_title, 
                department.department_name AS department, role.salary AS salary, employee.manager_id as manager
                FROM employee, role, department
                WHERE department.id = role.department_id
                AND role.id = employee.role_id
                ORDER BY employee.id ASC`;
  // AND employee.manager_id = employee.first_name`
  connection /*.promise()*/
    .query(sql, (err, rows) => {
      if (err) throw err;
      console.table(rows);
      promptUser();
    });
};

viewEmployeesByManager = () => {
  let sql = `SELECT employee.id, employee.first_name, employee.last_name, employee.manager_id FROM employee`;
  let employeeList = [];

  connection.query(sql, (error, response) => {
    if (error) throw error;

    response.forEach((employee) => {
      employeeList.push(employee.first_name + ' ' + employee.last_name);
    });

    inquirer
      .prompt([
        {
          type: 'list',
          name: 'manager',
          message: 'Select Manager to view employees they manage:',
          choices: employeeList,
        },
      ])
      .then((res) => {
        console.log(res.manager);
        let managerID;

        response.forEach((employee) => {
          if (res.manager === employee.first_name + ' ' + employee.last_name) {
            managerID = employee.id;
            console.log('success' + managerID);
          }
        });
          const sql = `SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, employee.manager_id 
          FROM employee
          WHERE employee.manager_id = ?`
          // INNER JOIN Employees ON Employees.manager_id=Employees.employee.id`
          ;

          connection.query(sql, [managerID], (error, response) => {
            if (error) throw error;
            console.table(response);
            promptUser();
          });
        });
      
  });
};

viewEmployeesByDepartment = () => {
  let sql = `SELECT department.department_name FROM department`;
  let departmentList = [];

  connection.query(sql, (error, response) => {
    if (error) throw error;
    
    console.log(response);

    response.forEach((department) => {
      departmentList.push(department.department_name);
    });

    inquirer
      .prompt([
        {
          type: 'list',
          name: 'department',
          message: 'Select department to view employees:',
          choices: departmentList,
        },
      ])
      .then((res) => {
       
        let dept_name = res.department;
        console.log(dept_name);
        
        const sql =  "SELECT first_name, last_name, department.department_name FROM ((employee INNER JOIN role ON role_id = role.id) INNER JOIN department ON department_id = department.id) WHERE department_name = ?;";
        connection.query(sql, [dept_name], (error, response) => {
          if (error) throw error;
          console.table(response);
          promptUser();
        });
          // const sql = `SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, employee.manager_id 
          // FROM employee
          // WHERE employee.manager_id = ?`
      

          // connection.query(sql, [managerID], (error, response) => {
          //   if (error) throw error;
          //   console.table(response);
          //   promptUser();
          // });
        });
      
  });
};

// ADD
addEmployee = () => {
  inquirer
    .prompt([
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
    .then((answer) => {
      const newEmployee = [answer.firstName, answer.lastName];
      const roleSQL = `Select role.id, role.title FROM role`;
      connection.query(roleSQL, (error, data) => {
        if (error) throw error;
        const roles = data.map(({ id, title }) => ({ name: title, value: id }));
        inquirer
          .prompt([
            {
              type: 'list',
              name: 'role',
              message: "What is the employee's role?",
              choices: roles,
            },
          ])
          .then((roleAnswer) => {
            const role = roleAnswer.role;
            newEmployee.push(role);
            const managerSQL = `SELECT * FROM employee`;
            connection.query(managerSQL, (error, data) => {
              if (error) throw error;
              const managers = data.map(({ id, first_name, last_name }) => ({
                name: first_name + ' ' + last_name,
                value: id,
              }));
              inquirer
                .prompt([
                  {
                    type: 'list',
                    name: 'manager',
                    message: "Who is the employee's manager?",
                    choices: managers,
                  },
                ])
                .then((managerChoice) => {
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

const addRole = () => {
  const sql = 'SELECT * FROM department';
  connection.query(sql, (error, response) => {
    if (error) throw error;
    let departments = [];
    response.forEach((department) => {
      departments.push(department.department_name);
    });

    inquirer
      .prompt([
        {
          type: 'list',
          name: 'departmentName',
          message: 'What department does this role belong to?',
          choices: departments,
        },
        {
          type: 'input',
          name: 'newRole',
          message: 'What is the name of the new role?',
          validate: (addRole) => {
            if (addRole) {
              return true;
            } else {
              console.log('Please enter the name of the new role:');
              return false;
            }
          },
        },
        {
          type: 'input',
          name: 'salary',
          message: 'What is the salary of this role?',
          validate: (addSalary) => {
            if (addSalary) {
              return true;
            } else {
              console.log('Please enter the salary of the new role:');
              return false;
            }
          },
        },
      ])
      .then((roleData) => {
        let newRoleName = roleData.newRole;
        let deptID; // = roleData.departmentName;

        response.forEach((department) => {
          if (roleData.department_name === department.department_name) {
            deptID = department.id;
          }
        });

        let sql = `INSERT INTO role (title, salary, department_id) VALUES (?,?,?)`;
        let newest = [newRoleName, roleData.salary, deptID];

        connection.query(sql, newest, (error) => {
          if (error) throw error;
          viewRoles();
        });
      });
  });
};

addDepartment = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'newDept',
        message: 'Please enter the name of the new department',
        validate: (addDept) => {
          if (addDept) {
            return true;
          } else {
            console.log('Please enter the name of the new role:');
            return false;
          }
        },
      },
    ])
    .then((deptData) => {
      let deptName = deptData.newDept;
      let sql = `INSERT INTO department (department_name) VALUES (?)`;

      connection.query(sql, deptName, (error) => {
        if (error) throw error;
        viewDepartments();
      });
    });
};

// UPDATE

updateEmployeeRole = () => {
  let sql =
    'SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id" FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id';
  let employeeList = [];

  connection.query(sql, (error, response) => {
    if (error) throw error;

    response.forEach((employee) => {
      employeeList.push(employee.first_name + ' ' + employee.last_name);
      console.log('employee');
      console.log(employee);
    });

    let sql = 'SELECT role.id, role.title FROM role';
    let roleList = [];
    connection.query(sql, (error, response) => {
      if (error) throw error;

      response.forEach((role) => {
        roleList.push(role.title);
      });

      inquirer
        .prompt([
          {
            type: 'list',
            name: 'chosenEmployee',
            message: 'Select Employee to update:',
            choices: employeeList,
          },
          {
            type: 'list',
            name: 'chosenRole',
            message: 'Select Role to update to:',
            choices: roleList,
          },
        ])
        .then((res) => {
          let newRoleID, employeeID;

          // function iterate(item) {
          //   // if(item)
          //   console.log(res);
          //   console.log();
          //   console.log(response);

          // }

          // response.forEach(iterate);

          response.forEach((role) => {
            console.log('%*%*%*');
            console.log(role);
            if (res.chosenRole === role.title) {
              console.log('success');
              console.log(role.id);
              newRoleID = role.id;
            }
          });

          for (let i = 0; i < employeeList.length; i++) {
            if (res.chosenEmployee === employeeList[i]) {
              console.log(res.chosenEmployee);
              console.log(employeeList[i]);
              employeeID = i + 1;
              console.log(employeeID);
            }
          }

          // employeeList.forEach((employee) => {
          //   if (res.chosenEmployee === employeeList[employee]) {
          //     employeeID = 'employee.id';
          //   }
          //
          // });

          let updateSQL = `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
          connection.query(updateSQL, [newRoleID, employeeID], (error) => {
            if (error) throw error;
            promptUser();
          });
        });
    });
  });
};

// Update employee managers
updateManager = () => {
  let sql = `SELECT employee.id, employee.first_name, employee.last_name, manager_id FROM employee`;

  let employeeList = [];

  connection.query(sql, (error, response) => {
    if (error) throw error;

    response.forEach((employee) => {
      employeeList.push(employee.first_name + ' ' + employee.last_name);
    });

    inquirer
      .prompt([
        {
          type: 'list',
          name: 'employee',
          message: 'Select Employee to change their manager',
          choices: employeeList,
        },
        {
          type: 'list',
          name: 'manager',
          message: 'Select new Manager',
          choices: employeeList,
        },
      ])
      .then((res) => {
        let employeeID, managerID;
        response.forEach((employee) => {
          if (res.employee === employee.first_name + ' ' + employee.last_name) {
            employeeID = employee.id;
          }

          if (res.manager === employee.first_name + ' ' + employee.last_name) {
            managerID = employee.id;
          }
        });

        console.log(employeeID, managerID);

        if (employeeID === managerID) {
          console.log('Invalid selection');
          // promptUser();
        } else {
          let sql = `UPDATE employee SET employee.manager_id = ? WHERE employee.id = ?`;

          connection.query(sql, [managerID, employeeID], (error) => {
            if (error) throw error;
            promptUser();
          });
        }
      });
  });
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
