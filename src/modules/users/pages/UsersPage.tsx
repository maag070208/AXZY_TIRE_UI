import { showToast } from "@app/core/store/toast/toast.slice";
import { ITButton, ITDialog } from "@axzydev/axzy_ui_system";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import UserForm from "../components/UserForm";
import { UsersTable } from "../components/UsersTable";
import {
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from "../services/UserService";
import { User } from "../types/user.types";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);

  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const dispatch = useDispatch();

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getAllUsers();
      if (res?.data) {
        console.log(res);
        setUsers(res.data);
      }
    } catch (error) {
      console.error("Error fetching users", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSaveUser = async (values: any) => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, values);
        dispatch(
          showToast({ message: "Usuario actualizado", type: "success" }),
        );
      } else {
        await createUser(values as any);
        dispatch(showToast({ message: "Usuario creado", type: "success" }));
      }
      setShowFormModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      dispatch(
        showToast({
          message: error?.message || "Error al guardar usuario",
          type: "error",
        }),
      );
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.id);
      dispatch(showToast({ message: "Usuario eliminado", type: "success" }));
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      dispatch(
        showToast({
          message: error?.message || "Error al eliminar usuario",
          type: "error",
        }),
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex flex-col gap-4 px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
          <ITButton
            label="Agregar"
            onClick={() => {
              setSelectedUser(null);
              setShowFormModal(true);
            }}
            className="shadow-md"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <UsersTable 
            data={users} 
            onEdit={(row: any) => {
                setSelectedUser(row);
                setShowFormModal(true);
            }}
            onDelete={(row: any) => {
                setSelectedUser(row);
                setShowDeleteModal(true);
            }}
        />
      </div>

      {/* User Form Modal */}
      <ITDialog
        isOpen={showFormModal}
        title={selectedUser ? "Editar Usuario" : "Crear Usuario"}
        onClose={() => {
          setShowFormModal(false);
          setSelectedUser(null);
        }}
      >
        <UserForm initialValues={selectedUser} onSubmit={handleSaveUser} />
      </ITDialog>

      {/* Delete User Modal */}
      <ITDialog
        isOpen={showDeleteModal}
        title="Confirmar Eliminación"
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
      >
        <div className="flex flex-col gap-4">
          <p>
            ¿Estás seguro que deseas eliminar a{" "}
            <b>
              {selectedUser?.name} {selectedUser?.lastName}
            </b>
            ?
          </p>
          <div className="flex justify-end gap-2">
            <ITButton
              label="Cancelar"
              variant="outlined"
              color="secondary"
              onClick={() => setShowDeleteModal(false)}
            />
            <ITButton
              label="Eliminar"
              color="danger"
              onClick={handleDeleteUser}
            />
          </div>
        </div>
      </ITDialog>
    </div>
  );
};

export default UsersPage;
