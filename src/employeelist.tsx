import React, { useState, useEffect } from "react";
import axios from "axios";

interface Employee {
  employeeID: number;
  employeeNumber: number;
  firstName: string;
  lastName: string;
  dateJoined: Date;
  extension?: number;
  roleID?: number;
  roleName: string;
}

interface Role {
  roleID: number;
  roleName: string;
}

interface Props {}

const EmployeeComponent: React.FC<Props> = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [newEmployee, setNewEmployee] = useState<Employee>({
    employeeID: 0,
    employeeNumber: 0,
    firstName: "",
    lastName: "",
    dateJoined: new Date(),
    roleName: "",
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [message, setMessage] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get<Employee[]>(
        "https://localhost:7287/api/Employees"
      );
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get<Role[]>(
        "https://localhost:7287/api/Employees/getroles"
      );
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    try {
      if (value.trim() === "") {
        fetchEmployees();
      } else {
        const response = await axios.get<Employee[]>(
          `https://localhost:7287/api/employees/search?searchTerm=${value}`
        );
        setEmployees(response.data);
      }
    } catch (error) {
      console.error("Error searching employees:", error);
    }
  };

  const handleFilterChange = async (column: string, value: string) => {
    setSearchTerm(value);
    try {
      if (value.trim() === "") {
        fetchEmployees(); // Assuming fetchEmployees fetches all employees again
      } else {
        const response = await axios.get<Employee[]>(
          `https://localhost:7287/api/employees/search?column=${column}&searchTerm=${value}`
        );
        setEmployees(response.data);
      }
    } catch (error) {
      console.error("Error searching employees:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`https://localhost:7287/api/employees/${id}`);
      setEmployees((prevEmployees) =>
        prevEmployees.filter((employee) => employee.employeeID !== id)
      );
      alert("Employee deleted successfully.");
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Error deleting employee.");
    }
  };

  const handleAdd = async () => {
    try {
      const response = await axios.post<Employee>(
        "https://localhost:7287/api/Employees",
        newEmployee
      );
      setEmployees([...employees, response.data]);
      setNewEmployee({
        employeeID: 0,
        employeeNumber: 0,
        firstName: "",
        lastName: "",
        dateJoined: new Date(),
        roleName: "",
      });
      alert("Employee added successfully.");
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Error adding employee.");
    }
  };

  const handleUpdate = async (id: number, updatedEmployee: Employee) => {
    try {
      const response = await axios.put<Employee>(
        `https://localhost:7287/api/employees/${id}`,
        updatedEmployee
      );
      const updatedEmployees = employees.map((employee) =>
        employee.employeeID === id ? response.data : employee
      );
      setEmployees(updatedEmployees);
      alert("Employee updated successfully.");
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Error updating employee.");
    }
  };

  const handleEdit = (employee: Employee) => {
    // Parse the date string into a Date object
    const dateJoined = new Date(employee.dateJoined);

    // Adjust the date by adding the time zone offset
    const offset = dateJoined.getTimezoneOffset();
    dateJoined.setMinutes(dateJoined.getMinutes() - offset);

    // Set the edited employee data with the adjusted Date object
    setNewEmployee({
      ...employee,
      dateJoined:
        dateJoined instanceof Date && !isNaN(dateJoined.getTime())
          ? dateJoined
          : new Date(),
    });
  };

  const validateForm = () => {
    return (
      newEmployee.firstName.trim() !== "" &&
      newEmployee.lastName.trim() !== "" &&
      newEmployee.employeeNumber !== 0 &&
      newEmployee.dateJoined !== null &&
      newEmployee.extension !== undefined &&
      newEmployee.roleID !== undefined
    );
  };

  const [sortBy, setSortBy] = useState<string>("employeeID");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedEmployees = [...employees].sort((a, b) => {
    if (sortBy === "dateJoined") {
      return sortOrder === "asc"
        ? a.dateJoined.getTime() - b.dateJoined.getTime()
        : b.dateJoined.getTime() - a.dateJoined.getTime();
    } else {
      return sortOrder === "asc"
        ? a[sortBy] > b[sortBy]
          ? 1
          : -1
        : b[sortBy] > a[sortBy]
        ? 1
        : -1;
    }
  });

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const pageCount = Math.ceil(sortedEmployees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedEmployees.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          backgroundColor: "#4CAF50",
          padding: "20px",
          color: "white",
          textAlign: "center",
        }}
      >
        <h1>Employee Management</h1>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              marginRight: "10px",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              flex: 1,
            }}
            placeholder="Search employees"
          />
        </div>

        <div style={{ width: "100%", maxWidth: "800px", margin: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2", borderRadius: "5px" }}>
                <th
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSortChange("employeeID")}
                >
                  Employee ID{" "}
                  {sortBy === "employeeID" && (
                    <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}
                </th>
                <th
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSortChange("firstName")}
                >
                  First Name{" "}
                  {sortBy === "firstName" && (
                    <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}
                </th>
                <th
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSortChange("lastName")}
                >
                  Last Name{" "}
                  {sortBy === "lastName" && (
                    <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}
                </th>
                <th
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSortChange("employeeNumber")}
                >
                  Employee Number{" "}
                  {sortBy === "employeeNumber" && (
                    <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}
                </th>
                <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                  Date Joined
                </th>
                <th
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSortChange("roleName")}
                >
                  Role{" "}
                  {sortBy === "roleName" && (
                    <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}
                </th>
                <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                  Actions
                </th>
              </tr>
              <tr>
                <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                  <input
                    type="text"
                    placeholder="Filter Employee ID"
                    onChange={(e) =>
                      handleFilterChange("employeeID", e.target.value)
                    }
                  />
                </th>
                <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                  <input
                    type="text"
                    placeholder="Filter First Name"
                    onChange={(e) =>
                      handleFilterChange("firstName", e.target.value)
                    }
                  />
                </th>
                <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                  <input
                    type="text"
                    placeholder="Filter Last Name"
                    onChange={(e) =>
                      handleFilterChange("lastName", e.target.value)
                    }
                  />
                </th>
                <th
                  style={{ padding: "10px", borderBottom: "1px solid #ccc" }}
                ></th>
                <th
                  style={{ padding: "10px", borderBottom: "1px solid #ccc" }}
                ></th>
                <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                  <input
                    type="text"
                    placeholder="Filter Role"
                    onChange={(e) =>
                      handleFilterChange("roleName", e.target.value)
                    }
                  />
                </th>
                <th
                  style={{ padding: "10px", borderBottom: "1px solid #ccc" }}
                ></th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((employee) => (
                <tr
                  key={employee.employeeID}
                  style={{ backgroundColor: "#fff", borderRadius: "5px" }}
                >
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #ccc" }}
                  >
                    {employee.employeeID}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #ccc" }}
                  >
                    {employee.firstName}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #ccc" }}
                  >
                    {employee.lastName}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #ccc" }}
                  >
                    {employee.employeeNumber}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #ccc" }}
                  >
                    {new Date(employee.dateJoined).toLocaleDateString()}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #ccc" }}
                  >
                    {employee.roleName}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #ccc" }}
                  >
                    <button
                      onClick={() => handleEdit(employee)}
                      style={{
                        marginRight: "5px",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee.employeeID)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "5px",
                        backgroundColor: "red",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              style={{
                margin: "0 10px",
                padding: "5px 10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(parseInt(e.target.value))}
              style={{
                margin: "0 10px",
                padding: "5px 10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              {Array.from({ length: pageCount }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <div
          style={{
            backgroundColor: "#4CAF50",
            padding: "20px",
            color: "white",
            borderRadius: "5px",
          }}
        >
          <h2>
            {newEmployee.employeeID ? "Update Employee" : "Add New Employee"}
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <label htmlFor="employeeNumber">
              Employee Number: <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="number"
              id="employeeNumber"
              value={newEmployee.employeeNumber || ""}
              onChange={(e) =>
                setNewEmployee({
                  ...newEmployee,
                  employeeNumber: parseInt(e.target.value),
                })
              }
              style={{
                marginBottom: "10px",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "100%",
                maxWidth: "300px",
              }}
              placeholder="Employee Number"
              required
            />
            <label htmlFor="firstName">
              First Name: <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              id="firstName"
              value={newEmployee.firstName}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, firstName: e.target.value })
              }
              style={{
                marginBottom: "10px",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "100%",
                maxWidth: "300px",
              }}
              placeholder="First Name"
              required
            />
            <label htmlFor="lastName">
              Last Name: <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              id="lastName"
              value={newEmployee.lastName}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, lastName: e.target.value })
              }
              style={{
                marginBottom: "10px",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "100%",
                maxWidth: "300px",
              }}
              placeholder="Last Name"
              required
            />
            <label htmlFor="dateJoined">
              Date Joined: <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="date"
              id="dateJoined"
              value={
                newEmployee.dateJoined instanceof Date
                  ? newEmployee.dateJoined.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setNewEmployee({
                  ...newEmployee,
                  dateJoined: new Date(e.target.value),
                })
              }
              style={{
                marginBottom: "10px",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "100%",
                maxWidth: "300px",
              }}
              required
            />
            <label htmlFor="extension">
              Extension: <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="number"
              id="extension"
              value={newEmployee.extension || ""}
              onChange={(e) =>
                setNewEmployee({
                  ...newEmployee,
                  extension: parseInt(e.target.value),
                })
              }
              style={{
                marginBottom: "10px",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "100%",
                maxWidth: "300px",
              }}
              placeholder="Extension"
              required
            />
            <label htmlFor="roleID">
              Role: <span style={{ color: "red" }}>*</span>
            </label>
            <select
              id="roleID"
              value={newEmployee.roleID || ""}
              onChange={(e) =>
                setNewEmployee({
                  ...newEmployee,
                  roleID: parseInt(e.target.value),
                })
              }
              style={{
                marginBottom: "20px",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "100%",
                maxWidth: "300px",
                backgroundColor: "#fff",
              }}
              required
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.roleID} value={role.roleID}>
                  {role.roleName}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (validateForm()) {
                  if (newEmployee.employeeID) {
                    handleUpdate(newEmployee.employeeID, newEmployee);
                  } else {
                    handleAdd();
                  }
                } else {
                  alert("Please fill in all required fields.");
                }
              }}
              style={{
                padding: "10px 20px",
                borderRadius: "5px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
              }}
            >
              {newEmployee.employeeID ? "Update Employee" : "Add Employee"}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p
            style={{
              color: message.includes("successfully") ? "green" : "red",
            }}
          >
            {message}
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeComponent;
