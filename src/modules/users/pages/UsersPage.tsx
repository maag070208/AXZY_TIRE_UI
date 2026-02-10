import { ITButton, ITDialog, ITLoader } from "axzy_ui_system";
import { useCallback, useEffect, useState } from "react";
import {
  FaChild,
  FaFilter,
  FaPencilAlt,
  FaSearch,
  FaTimes,
  FaTrash,
  FaUser,
  FaUserShield,
  FaUserTie,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { showToast } from "@app/core/store/toast/toast.slice";
import UserForm from "../components/UserForm";
import {
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from "../services/UserService";
import { User, UserRole } from "../types/user.types";
import { getChildByUserId, createChild, updateChild, deleteChild } from "@app/modules/children/service/ChildrenService";
import ChildForm from "@app/modules/children/components/ChildForm";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Children Management States
  const [showChildrenModal, setShowChildrenModal] = useState(false);
  const [userChildren, setUserChildren] = useState<any[]>([]);
  const [showChildForm, setShowChildForm] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);

  const dispatch = useDispatch();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      if (res?.data) {
        setUsers(res.data);
      }
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSaveUser = async (values: any) => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, values);
        dispatch(showToast({ message: "Usuario actualizado", type: "success" }));
      } else {
        await createUser(values as any);
        dispatch(showToast({ message: "Usuario creado", type: "success" }));
      }
      setShowFormModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
        dispatch(showToast({ message: error?.message || "Error al guardar usuario", type: "error" }));
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
        dispatch(showToast({ message: error?.message || "Error al eliminar usuario", type: "error" }));
    }
  };

  // Children Logic
  const handleOpenChildrenModal = async (user: User) => {
      setSelectedUser(user);
      setShowChildrenModal(true);
      setShowChildForm(false);
      fetchChildrenForUser(user.id);
  };

  const fetchChildrenForUser = async (userId: number) => {
      try {
          const res = await getChildByUserId(userId);
          setUserChildren(res.data || []);
      } catch (error) {
          console.error("Error fetching children", error);
      }
  };

  const handleSaveChild = async (values: any) => {
      if (!selectedUser) return;
      try {
          if (selectedChild) {
              await updateChild(selectedChild.id, values);
              dispatch(showToast({ message: "Hijo actualizado", type: "success" }));
          } else {
              await createChild({
                  ...values,
                  userId: selectedUser.id,
                  birthDate: new Date(values.birthDate).toLocaleDateString("en-CA"),
              });
              dispatch(showToast({ message: "Hijo agregado", type: "success" }));
          }
          setShowChildForm(false);
          setSelectedChild(null);
          fetchChildrenForUser(selectedUser.id);
      } catch (error: any) {
          dispatch(showToast({ message: error?.message || "Error al guardar hijo", type: "error" }));
      }
  };

  const handleDeleteChild = async (childId: number) => {
      try {
          await deleteChild(childId);
          dispatch(showToast({ message: "Hijo eliminado", type: "success" }));
          if (selectedUser) fetchChildrenForUser(selectedUser.id);
      } catch (error: any) {
        dispatch(showToast({ message: error?.message || "Error al eliminar hijo", type: "error" }));
      }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole ? user.role === filterRole : true;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return <FaUserShield className="text-red-500" />;
      case UserRole.COACH:
        return <FaUserTie className="text-blue-500" />;
      default:
        return <FaUser className="text-green-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
      switch (role) {
        case UserRole.ADMIN: return "Administrador";
        case UserRole.COACH: return "Entrenador";
        case UserRole.USER: return "Usuario";
        default: return role;
      }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex flex-col gap-4 px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
          <div className="flex gap-2">
            <button
                className="md:hidden flex items-center gap-2 text-indigo-600 font-medium text-sm bg-indigo-50 px-3 py-1.5 rounded-lg"
                onClick={() => setShowFilters(!showFilters)}
            >
                <FaFilter />
            </button>
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

        {/* Filters */}
        <div className={`gap-4 ${showFilters ? 'flex' : 'hidden'} md:flex flex-col md:flex-row`}>
            {/* Search */}
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {/* Role Filter */}
            <div className="md:w-64">
                <select 
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                >
                    <option value="">Todos los Roles</option>
                    <option value={UserRole.ADMIN}>Administradores</option>
                    <option value={UserRole.COACH}>Entrenadores</option>
                    <option value={UserRole.USER}>Usuarios Normales</option>
                </select>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading ? (
           <div className="flex h-full items-center justify-center">
             <ITLoader />
           </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
                <div
                key={user.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 relative overflow-hidden group"
                >
                    {/* Role Badge */}
                    <div className="absolute top-0 right-0 bg-gray-50 px-3 py-1 rounded-bl-xl text-xs font-bold text-gray-500 flex items-center gap-1">
                        {getRoleIcon(user.role)}
                        {getRoleLabel(user.role)}
                    </div>

                    <div className="flex items-start gap-4 mt-2">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 text-xl font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                {user.name} {user.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-1"></div>

                    <div className="flex flex-wrap gap-2 mt-auto">
                        {user.role === UserRole.USER && (
                            <button
                                onClick={() => handleOpenChildrenModal(user)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors text-xs font-medium bg-gray-50"
                            >
                                <FaChild className="text-sm" />
                                <span>Hijos</span>
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setSelectedUser(user);
                                setShowFormModal(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-xs font-medium bg-gray-50"
                        >
                            <FaPencilAlt className="text-sm" />
                            <span>Editar</span>
                        </button>
                        <button
                            onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                            }}
                            className="flex-none w-10 flex items-center justify-center py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors bg-gray-50"
                            title="Eliminar"
                        >
                            <FaTrash className="text-sm" />
                        </button>
                    </div>
                </div>
            ))}
            </div>
        )}
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
            <p>¿Estás seguro que deseas eliminar a <b>{selectedUser?.name} {selectedUser?.lastName}</b>?</p>
            <div className="flex justify-end gap-2">
                <ITButton label="Cancelar" variant="outlined" color="secondary" onClick={() => setShowDeleteModal(false)} />
                <ITButton label="Eliminar" color="danger" onClick={handleDeleteUser} />
            </div>
        </div>
      </ITDialog>

      {/* Children Management Modal */}
      <ITDialog
        isOpen={showChildrenModal}
        title={`Hijos de ${selectedUser?.name}`}
        onClose={() => {
            setShowChildrenModal(false);
            setSelectedUser(null);
        }}
        className="w-full max-w-lg"
      >
        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            {!showChildForm ? (
                <>
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Lista de Hijos</h3>
                        <ITButton 
                            label="Agregar Hijo" 
                            onClick={() => {
                                setSelectedChild(null);
                                setShowChildForm(true);
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        {userChildren.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">No hay hijos registrados</p>
                        ) : (
                            userChildren.map(child => (
                                <div key={child.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                                    <div>
                                        <p className="font-bold">{child.name} {child.lastName}</p>
                                        <p className="text-xs text-gray-500">Nacimiento: {new Date(child.birthDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setSelectedChild(child); setShowChildForm(true); }} className="text-blue-500 hover:bg-blue-100 p-2 rounded-full"><FaPencilAlt /></button>
                                        <button onClick={() => handleDeleteChild(child.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-full"><FaTrash /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-2">
                        <button onClick={() => setShowChildForm(false)} className="text-gray-500 hover:text-gray-700"><FaTimes /></button>
                        <h3 className="font-bold">{selectedChild ? "Editar Hijo" : "Nuevo Hijo"}</h3>
                    </div>
                    <ChildForm 
                        initialValues={selectedChild} 
                        onSubmit={handleSaveChild}
                    />
                </div>
            )}
        </div>
      </ITDialog>
    </div>
  );
};

export default UsersPage;
