const inquirer = require("inquirer");
const connection = require("./db/connection");
const logo = require("asciiart-logo");
const chalk = require("chalk");

require("console.table");
// if using promises use the two code lines below

// const utils = require("util");
// db.query = utils.promisify(db.query);

init();

function init(){
    const logoText = logo({ name: "Employee Tracker" }).render();
    console.log(chalk.green(logoText));
    trackerApp();
}

function trackerApp(){
    inquirer
    .prompt({
        type: "list",
        name: "task",
        message: "What would you like to do?",
        choices: [
            "View Employees",
            "Add Employee",
            "View All Roles",
            "Update Employee Role",
            "Add Role",
            "View All Departments",
            "Add Department",
            "Remove Employees",
            "End"
            // Add bonus array here //
        ]
    })
    .then(function ({ task }){
        switch (task) {
            case "View Employees": viewEmployee();
            break;

            case "Add Employee": addEmployee();
            break;

            case "Update Employee Role": updateEmployeeRole();
            break;

            case "View All Roles": viewAllRoles();
            break;

            case "Add Role": addRole();
            break;

            case "View All Departments": viewAllDepartments();
            break;

            case "Add Department": addDepartment();
            break;

            case "View Employees By Department": viewEmployeeByDepartment();
            break;

            case "Remove Employees": removeEmployees();
            break;

            default: process.exit(0);
            
        }
    });
}

// To view Employees/ READ all, SELECT * FROM

function viewEmployee(){
    console.log("List of Employees\n");

    let query = 
    `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role ON role.id=employee.role_id
    LEFT JOIN department 
    ON department.id = role.department_id
    
    LEFT JOIN employee manager
    ON manager.id = employee.manager_id

    `
    connection.query(query, function (err, res){
        if (err) console.log(err);

        console.table(res);
        console.log("Employees viewed!\n");
        trackerApp();
    })
}

// Add employee array
function addEmployee(){
    console.log("Add employee")

    let query = `SELECT r.id, r.title 
    FROM role r`

    connection.query(query, function (err, res){
        if (err) console.log(err);

        const roleChoices = res.map(({ id, title }) => ({
            value: id, name: `${title}`
        }));

        
       
        connection.query("SELECT * FROM employee", function(err, res) {
            if (err) console.log(err)
            const managerChoices = res.map(({ id, first_name, last_name }) => ({
                value: id, name: `${first_name} ${last_name}`
            }));
            promptInsert(roleChoices, managerChoices);
        })
        

    });
}

function promptInsert(roleChoices, managerChoices){
    inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's first name?"
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's last name?"
      },
      {
        type: "list",
        name: "roleId",
        message: "What is the employee's role?",
        choices: roleChoices
      },
      {
        type: "list",
        name: "managerId",
        message: "Who is the employee's manager?",
        choices: managerChoices
      }
    ])
    .then(function (answer) {
      console.log(answer);

      var query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) values (?,?,?,?)`
      
      connection.query(query,
        [
        answer.first_name,
        answer.last_name,
        answer.roleId,
        answer.managerId,
        ],
        function (err, res) {
          if (err) console.log(err);

          
          console.log("Inserted successfully!\n");

          trackerApp();
        });
    });
}

// Update employee role

function updateEmployeeRole() { 
    employeeArray();
  
  }
  
  function employeeArray() {
    console.log("Updating an employee");
  
    var query =
      `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    JOIN role r
      ON e.role_id = r.id
    JOIN department d
    ON d.id = r.department_id
    JOIN employee m
      ON m.id = e.manager_id`
  
    connection.query(query, function (err, res) {
      if (err) console.log(err);
  
      const employeeChoices = res.map(({ id, first_name, last_name }) => ({
        value: id, name: `${first_name} ${last_name}`      
      }));
  
      console.table(res);
      console.log("employeeArray To Update!\n")
  
      roleArray(employeeChoices);
    });
  }
  function roleArray(employeeChoices) {
    console.log("Updating a role");
  
    var query =
      `SELECT r.id, r.title, r.salary 
    FROM role r`
    let roleChoices;
  
    connection.query(query, function (err, res) {
      if (err) console.log(err);
  
      roleChoices = res.map(({ id, title, salary }) => ({
        value: id, title: `${title}`, salary: `${salary}`      
      }));
  
      console.table(res);
      console.log("roleArray to Update!\n")
  
      promptEmployeeRole(employeeChoices, roleChoices);
    });
  }
  function promptEmployeeRole(employeeChoices, roleChoices) {

    inquirer
      .prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Which employee do you want to set with the role?",
          choices: employeeChoices
        },
        {
          type: "list",
          name: "roleId",
          message: "Which role do you want to update?",
          choices: roleChoices
        },
      ])
      .then(function (answer) {
  
        var query = `UPDATE employee SET role_id = ? WHERE id = ?`
        // when finished prompting, insert a new item into the db with that info
        connection.query(query,
          [ answer.roleId,  
            answer.employeeId
          ],
          function (err, res) {
            if (err) throw err;
  
            console.table(res);
            console.log(res.affectedRows + "Updated successfully!");
  
            trackerApp();
          });
      });
  }

function viewAllRoles(){
    connection.query("SELECT * FROM role", function(err, res){
        if (err) console.log(err);
        console.table(res);
        console.log("Viewing All Roles")

        trackerApp();
    })
    

}

//"Add Role" / CREATE: INSERT INTO
function addRole() {

    var query =
      `SELECT d.id, d.name, r.salary AS budget
      FROM employee e
      JOIN role r
      ON e.role_id = r.id
      JOIN department d
      ON d.id = r.department_id
      GROUP BY d.id, d.name`
  
    connection.query(query, function (err, res) {
      if (err) console.log(err);
  
    
      const departmentChoices = res.map(({ id, name }) => ({
        value: id, name: `${id} ${name}`
      }));
  
      console.table(res);
      console.log("Department list!");
  
      promptAddRole(departmentChoices);
    });
  }
  
  function promptAddRole(departmentChoices) {
  
    inquirer
      .prompt([
        {
          type: "input",
          name: "roleTitle",
          message: "Role title?"
        },
        {
          type: "input",
          name: "roleSalary",
          message: "Role Salary"
        },
        {
          type: "list",
          name: "departmentId",
          message: "Department?",
          choices: departmentChoices
        },  
    ])
    .then(function (answer) {

      var query = `INSERT INTO role SET ?`

      connection.query(query, {
        title: answer.title,
        salary: answer.salary,
        department_id: answer.departmentId
      },
        function (err, res) {
          if (err) console.log(err);

          console.table(res);
          console.log("Role Inserted!");

          trackerApp();
        });

    });
}

function viewAllDepartments(){
    connection.query("SELECT * FROM department", function(err, res){
        if (err) console.log(err);
        console.table(res);
        console.log("View All Departments.\n");

        trackerApp();
    });
}

function viewEmployeeByDepartment() {
    console.log("Viewing employees by department\n");
  
    var query =
      `SELECT d.id, d.name, r.salary AS budget
    FROM employee e
    LEFT JOIN role r
      ON e.role_id = r.id
    LEFT JOIN department d
    ON d.id = r.department_id
    GROUP BY d.id, d.name`
  
    connection.query(query, function (err, res) {
      if (err) console.log(err);
  
      const departmentChoices = res.map(data => ({
        value: data.id, name: data.name
      }));
  
      console.table(res);
      console.log("Department view succeed!\n");
  
      promptDepartment(departmentChoices);
    });
  }
  
  // User choose the department list, then employees pop up
  function promptDepartment(departmentChoices) {
  
    inquirer
      .prompt([
        {
          type: "list",
          name: "departmentId",
          message: "Which department would you choose?",
          choices: departmentChoices
        }
      ])
      .then(function (answer) {
        console.log("answer ", answer.departmentId);
  
        var query =
          `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department 
    FROM employee e
    JOIN role r
      ON e.role_id = r.id
    JOIN department d
    ON d.id = r.department_id
    WHERE d.id = ?`
  
        connection.query(query, answer.departmentId, function (err, res) {
          if (err) console.log(err);
  
          console.table("response ", res);
          console.log(res.affectedRows + "Employees are viewed!\n");
  
          trackerApp();
        });
      });
  }
  
  function removeEmployees() {
    console.log("Deleting an employee");
  
    var query =
      `SELECT e.id, e.first_name, e.last_name
        FROM employee e`
  
    connection.query(query, function (err, res) {
      if (err) console.log(err);
  
      const deleteEmployeeChoices = res.map(({ id, first_name, last_name }) => ({
        value: id, name: `${id} ${first_name} ${last_name}`
      }));
  
      console.table(res);
      console.log("Emloyee to delete!\n");
  
      promptDelete(deleteEmployeeChoices);
    });
  }
  
  // User choose the employee list, then employee is deleted
  function promptDelete(deleteEmployeeChoices) {
  
    inquirer
      .prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Which employee do you want to remove?",
          choices: deleteEmployeeChoices
        }
      ])
      .then(function (answer) {
  
        var query = `DELETE FROM employee WHERE ?`;
        // when finished prompting, insert a new item into the db with that info
        connection.query(query, { id: answer.employeeId }, function (err, res) {
          if (err) console.log(err);
  
          console.table(res);
          console.log(res.affectedRows + "Deleted!\n");
  
          trackerApp();
        });
      });
  }

trackerApp();