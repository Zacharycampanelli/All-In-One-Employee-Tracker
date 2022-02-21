// const express = require('express');
const connection = require('./db/connections');
const inquirer = require('inquirer');
const cTable = require('console.table');
const mysql = require('mysql2');
const mysql2 = require('mysql2/promise');
const { connect } = require('./db/connections');
const PromptUI = require('inquirer/lib/ui/prompt');

// Database connect
connection.connect((error) => {
  if (error) throw error;
  console.log('==============================');
  console.log('Professional Employee Tracker');
  console.log('==============================');
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
          'Delete employee',
          // 'Delete role',
          // 'Delete department',
          // 'View combined salaries of a department',
          'Exit',
        ],
      },
    ])
    .then((answers) => {
      const { choices } = answers;
      console.log('==============================');
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

      if (choices === 'Delete employee') {
        deleteEmployee();
      }

      // if (choices === 'Delete role') {
      //   deleteRole();
      // }

      // if (choices === 'Delete department') {
      //   deleteDepartment();
      // }

      // if (choices === 'View combined salaries of a department') {
      //   viewCombinedSalaries();
      // }

      if (choices === 'Exit') {
        connection.end();
      }
    });
};

// VIEW

// View all departments in database
viewDepartments = () => {
  console.log('==============================');
  const sql = `SELECT department.id AS id, department.department_name AS department FROM department `;
  connection /*.promise()*/
    .query(sql, (err, rows) => {
      if (err) throw err;
      console.table(rows);
      console.log('==============================');
      promptUser();
    });
};

// View all job roles in database
viewRoles = () => {
  console.log('==============================');
  const sql = `SELECT role.title, role.salary,   department.department_name 
  FROM role
  LEFT OUTER JOIN department ON role.department_id = department.id`;
  connection /*.promise()*/
    .query(sql, (err, rows) => {
      if (err) throw err;
      console.table(rows);
      console.log('==============================');
      promptUser();
    });
};

// View all employees in database
viewEmployees = () => {
  console.log('==============================');
  const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title,
  department.department_name AS department,role.salary,COALESCE(CONCAT(a.first_name, " ", a.last_name), ' ') AS manager
  FROM employee
  LEFT JOIN role ON employee.role_id = role.id
  LEFT JOIN department ON role.department_id = department.id
  LEFT JOIN employee a ON a.id = employee.manager_id`;

  connection /*.promise()*/
    .query(sql, (err, response) => {
      if (err) throw err;
      console.table(response);
      console.log('==============================');
      promptUser();
    });
};

// View all employees in the database under a selected manager
viewEmployeesByManager = () => {
  console.log('==============================');
  const sql = `SELECT employee.id, employee.first_name, employee.last_name, employee.manager_id FROM employee`;
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
        let managerID;

        response.forEach((employee) => {
          if (res.manager === employee.first_name + ' ' + employee.last_name) {
            managerID = employee.id;
          }
        });
        const sql = `SELECT e1.first_name AS first_name, e1.last_name AS last_name, e1.manager_id, 
        CONCAT_WS(' ',COALESCE(e2.first_name, 'unknown'), COALESCE(e2.last_name , 'unknown')) AS manager_name
          FROM employee as e1
          LEFT OUTER JOIN employee AS e2 ON e2.id = e1.manager_id
          WHERE e1.manager_id = ?`;

        connection.query(sql, [managerID], (error, response) => {
          if (error) throw error;
          console.table(response);
          console.log('==============================');
          promptUser();
        });
      });
  });
};

// View all employees in the database under a selected department
viewEmployeesByDepartment = () => {
  console.log('==============================');
  const sql = `SELECT department.department_name FROM department`;
  let departmentList = [];

  connection.query(sql, (error, response) => {
    if (error) throw error;

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

        const sql =
          'SELECT first_name, last_name, department.department_name FROM ((employee INNER JOIN role ON role_id = role.id) INNER JOIN department ON department_id = department.id) WHERE department_name = ?;';
        connection.query(sql, [dept_name], (error, response) => {
          if (error) throw error;
          console.table(response);
          console.log('==============================');
          promptUser();
        });
      });
  });
};

// viewCombinedSalaries = () => {};

// ADD

// Add a single employee to the database
addEmployee = () => {
  console.log('==============================');
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
      connection.query(roleSQL, (error, response) => {
        if (error) throw error;
        const roles = response.map(({ id, title }) => ({
          name: title,
          value: id,
        }));
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
            connection.query(managerSQL, (error, response) => {
              if (error) throw error;
              const managers = response.map(
                ({ id, first_name, last_name }) => ({
                  name: first_name + ' ' + last_name,
                  value: id,
                })
              );
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
                  const manager = managerChoice.manager;
                  newEmployee.push(manager);
                  const sql = `INSERT INTO employee(first_name, last_name, role_id, manager_id)
                                    VALUES(?, ?, ?, ?)`;
                  connection.query(sql, newEmployee, (error) => {
                    if (error) throw error;
                    viewEmployees();
                    console.log('==============================');
              
                  });
                });
            });
          });
      });
    });
};

// async function getDepartmentId(departmentName) {
//   let sql = 'SELECT * FROM department WHERE department.department_name=?';
//   let args = [departmentName];
//   connection.query(sql, args, (error, response) => {
//     if (error) throw error;
//     const id = response;
//     console.log('here', id[0].id);
//     return response.id;
//   });
// }

// Add a new role to the database
const addRole = () => {
  console.log('==============================');
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
        let deptID;

        for (let i = 0; i < response.length; i++) {
          if(response[i].department_name === roleData.departmentName)
          deptID = response[i].id;
        }

        newRole = roleData.newRole;
        newSalary = roleData.salary;

        const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
        connection.query(sql, [newRole, newSalary, deptID], (error) => {
          if (error) throw error;
          viewRoles();
          console.log('==============================');
          
        });
      });
  });
};

// Add a new department to the database
addDepartment = () => {
  console.log('==============================');
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
      const sql = `INSERT INTO department (department_name) VALUES (?)`;

      connection.query(sql, deptName, (error) => {
        if (error) throw error;
        viewDepartments();
        console.log('==============================');

      });
    });
};

// UPDATE

// Update an employee's role
updateEmployeeRole = () => {
  console.log('==============================');
  const sql =
    'SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id" FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id';
  let employeeList = [];

  connection.query(sql, (error, response) => {
    if (error) throw error;

    response.forEach((employee) => {
      employeeList.push(employee.first_name + ' ' + employee.last_name);
    });

    const sql = 'SELECT role.id, role.title FROM role';
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

          response.forEach((role) => {
            if (res.chosenRole === role.title) {
              newRoleID = role.id;
            }
          });

          for (let i = 0; i < employeeList.length; i++) {
            if (res.chosenEmployee === employeeList[i]) {
              employeeID = i + 1;
            }
          }

          const updateSQL = `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
          connection.query(updateSQL, [newRoleID, employeeID], (error) => {
            if (error) throw error;
            viewEmployees();
            console.log('==============================');
          });
        });
    });
  });
};

// Update an employee's manager
updateManager = () => {
  console.log('==============================');
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

        if (employeeID === managerID) {
          console.log('Invalid selection');
          updateManager();
        } else {
          let sql = `UPDATE employee SET employee.manager_id = ? WHERE employee.id = ?`;

          connection.query(sql, [managerID, employeeID], (error) => {
            if (error) throw error;
            viewEmployees();
          });
        }
      });
  });
};

// DELETE

// Delete an employee from the database
deleteEmployee = () => {
  console.log('==============================');
  const sql = `SELECT employee.first_name, employee.last_name FROM employee`;

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
          message: 'Select Employee to Delete',
          choices: employeeList,
        },
      ])
      .then((res) => {
        let employee = res.employee;
        employee = employee.split(' ');
        firstName = employee[0];
        lastName = employee[1];

        const sql = `DELETE from employee WHERE employee.first_name = ? AND employee.last_name = ?`;
        connection.query(sql, [firstName, lastName], (error) => {
          if (error) throw error;
          viewEmployees();
          console.log('==============================');
        });
      });
  });
};

// Delete a role from the database
deleteRole = () => {
  console.log('==============================');
  const sql = `SELECT role.title FROM role`;

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
          name: 'role',
          message: 'Select Role to Delete',
          choices: roleList,
        },
      ])
      .then((res) => {
        let roleToDelete = res.role;

        const sql = `DELETE from role WHERE role.title = ? `;
        connection.query(sql, roleToDelete, (error) => {
          if (error) throw error;
          console.log('==============================');
          promptUser();
        });
      });
  });
};

// Delete a department from the database
deleteDepartment = () => {
  console.log('==============================');
  const sql = `SELECT department.department_name FROM department`;

  let departmentList = [];

  connection.query(sql, (error, response) => {
    if (error) throw error;

    response.forEach((department) => {
      departmentList.push(department.department_name);
    });

    inquirer
      .prompt([
        {
          type: 'list',
          name: 'department',
          message: 'Select Department to Delete',
          choices: departmentList,
        },
      ])
      .then((res) => {
        let deptToDelete = res.department;

        const sql = `DELETE from department WHERE department.department_name = ? `;
        connection.query(sql, deptToDelete, (error) => {
          if (error) throw error;
          console.log('==============================');
          promptUser();
        });
      });
  });
};
