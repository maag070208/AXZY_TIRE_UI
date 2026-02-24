import { ITButton, ITInput } from "@axzydev/axzy_ui_system";
import { useEffect, useState } from "react";
import { FaCompactDisc, FaMinus, FaPlus, FaSearch, FaTrash, FaWrench } from "react-icons/fa";
import { getAllServices } from "../../services/services/ServiceService";
import { Service } from "../../services/types/service.types";
import { getAllTires } from "../../tires/services/TireService";
import { Tire } from "../../tires/types/tire.types";

interface CartItem {
  uid: string; // Unique identifier for the cart logic
  id: number;
  name: string;
  type: "TIRE" | "SERVICE";
  unitPrice: number;
  quantity: number;
  subtotal: number;
  maxStock?: number; // Only for tires
}

interface PosInterfaceProps {
  onCheckout: (cart: CartItem[], total: number, clearCart: () => void) => void;
}

export const PosInterface = ({ onCheckout }: PosInterfaceProps) => {
  const [activeTab, setActiveTab] = useState<"TIRES" | "SERVICES">("TIRES");
  const [searchTerm, setSearchTerm] = useState("");
  const [tireFilter, setTireFilter] = useState<"ALL" | "NUEVA" | "SEMINUEVA" | "GALLITO">("ALL");
  
  const [tires, setTires] = useState<Tire[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [tiresRes, servicesRes] = await Promise.all([
          getAllTires(),
          getAllServices(),
        ]);
        if (tiresRes?.data) setTires(tiresRes.data.filter((t: Tire) => t.currentStock > 0)); 
        if (servicesRes?.data) setServices(servicesRes.data.filter((s: Service) => s.isActive));
      } catch (error) {
        console.error("Error fetching catalogs", error);
      }
    };
    fetchCatalog();
  }, []);

  const handleAddToCart = (item: any, type: "TIRE" | "SERVICE") => {
    const isTire = type === "TIRE";
    const name = isTire ? `${item.brand} ${item.model} ${item.size}` : item.name;
    const price = isTire ? item.price : item.basePrice;
    const maxStock = isTire ? item.currentStock : undefined;

    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id && c.type === type);
      if (existing) {
        if (isTire && existing.quantity >= (maxStock || 0)) return prev; // Cannot exceed stock
        return prev.map((c) =>
          c.id === item.id && c.type === type
            ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * price }
            : c
        );
      }
      return [
        ...prev,
        { uid: `${type}-${item.id}`, id: item.id, name, type, unitPrice: price, quantity: 1, subtotal: price, maxStock },
      ];
    });
  };

  const updateCartQuantity = (uid: string, delta: number) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.uid === uid) {
          const newQ = c.quantity + delta;
          if (newQ <= 0) return c; // will be handled by remove
          if (c.type === "TIRE" && c.maxStock && newQ > c.maxStock) return c;
          return { ...c, quantity: newQ, subtotal: newQ * c.unitPrice };
        }
        return c;
      })
    );
  };

  const removeFromCart = (uid: string) => {
    setCart((prev) => prev.filter((c) => c.uid !== uid));
  };

  const cartTotal = cart.reduce((acc, curr) => acc + curr.subtotal, 0);

  // Filters
  const filteredTires = tires.filter((t) => {
    const rawSearch = searchTerm.toLowerCase();
    const rawTarget = `${t.brand} ${t.model} ${t.size} ${t.sku}`.toLowerCase();
    
    // Create compressed version to allow searching '2357515' matching '235/75R15'
    const compressedSearch = rawSearch.replace(/[\/\-\sr]/g, "");
    const compressedTarget = rawTarget.replace(/[\/\-\sr]/g, "");

    const matchesSearch = rawTarget.includes(rawSearch) || (compressedSearch.length > 0 && compressedTarget.includes(compressedSearch));
    const matchesFilter = tireFilter === "ALL" || t.type === tireFilter;
    
    return matchesSearch && matchesFilter;
  });
  
  const filteredServices = services.filter((s) => 
    `${s.name} ${s.category}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* LEFT: CATALOG */}
      <div className="flex-1 overflow-hiddnen flex flex-col bg-gray-50 border-r border-gray-200">
        
        {/* Search & Tabs */}
        <div className="p-4 bg-white shadow-sm z-10">
          <div className="flex bg-gray-100 rounded-lg p-1 w-full max-w-md mx-auto mb-4">
               <button 
                onClick={() => setActiveTab("TIRES")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === "TIRES" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
                   <FaCompactDisc /> Llantas
               </button>
               <button 
                onClick={() => setActiveTab("SERVICES")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === "SERVICES" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
                   <FaWrench /> Servicios
               </button>
          </div>
          
          <div className="relative max-w-2xl mx-auto flex flex-col gap-3">
             <div className="relative">
               <ITInput 
                 name="search" 
                 placeholder={activeTab === "TIRES" ? "Buscar por marca, modelo, medida o SKU..." : "Buscar servicio..."}
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 onBlur={() => {}}
               />
               <FaSearch className="absolute right-4 top-1/2 -translate-y-[20%] text-gray-400 pointer-events-none" />
             </div>

             {activeTab === "TIRES" && (
                 <div className="flex gap-2 justify-center items-center flex-wrap">
                    <button onClick={() => setTireFilter("ALL")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${tireFilter === 'ALL' ? 'bg-gray-800 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Todas</button>
                    <button onClick={() => setTireFilter("NUEVA")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${tireFilter === 'NUEVA' ? 'bg-green-600 text-white shadow-md' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>Nuevas</button>
                    <button onClick={() => setTireFilter("SEMINUEVA")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${tireFilter === 'SEMINUEVA' ? 'bg-yellow-500 text-white shadow-md' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}>Seminuevas</button>
                    <button onClick={() => setTireFilter("GALLITO")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${tireFilter === 'GALLITO' ? 'bg-gray-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Gallitos</button>
                 </div>
             )}
          </div>
        </div>

        {/* Grid List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
           <div className="pb-8">
              {activeTab === "TIRES" && (
                <div className="flex flex-col gap-8">
                  {/* Nuevas */}
                  {filteredTires.filter(t => t.type === 'NUEVA').length > 0 && (
                    <div>
                      <h3 className="text-xl font-black text-gray-800 border-b-2 border-gray-100 pb-3 mb-5">Llantas Nuevas</h3>
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredTires.filter(t => t.type === 'NUEVA').map((tire) => (
                          <div key={tire.id} onClick={() => handleAddToCart(tire, "TIRE")} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-green-300 transition-all flex flex-col h-full active:scale-95 group">
                              <div className="flex justify-between items-start mb-3">
                                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">Nueva</span>
                                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">Stock: {tire.currentStock}</span>
                              </div>
                              <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-green-600 transition-colors" title={`${tire.brand} ${tire.model}`}>{tire.brand} {tire.model}</h3>
                              <p className="text-sm text-gray-500 font-mono mt-2 bg-gray-50 p-1 rounded inline-block self-start">{tire.size}</p>
                              <div className="mt-auto pt-4 flex items-end justify-between">
                                <span className="text-2xl font-black text-green-600">${tire.price.toFixed(2)}</span>
                                <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><FaPlus size={12}/></div>
                              </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Seminuevas */}
                  {filteredTires.filter(t => t.type === 'SEMINUEVA').length > 0 && (
                    <div>
                      <h3 className="text-xl font-black text-gray-800 border-b-2 border-gray-100 pb-3 mb-5">Llantas Seminuevas</h3>
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredTires.filter(t => t.type === 'SEMINUEVA').map((tire) => (
                           <div key={tire.id} onClick={() => handleAddToCart(tire, "TIRE")} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-yellow-400 transition-all flex flex-col h-full active:scale-95 group">
                              <div className="flex justify-between items-start mb-3">
                                  <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-md">Seminueva</span>
                                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">Stock: {tire.currentStock}</span>
                              </div>
                              <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-yellow-600 transition-colors" title={`${tire.brand} ${tire.model}`}>{tire.brand} {tire.model}</h3>
                              <p className="text-sm text-gray-500 font-mono mt-2 bg-gray-50 p-1 rounded inline-block self-start">{tire.size}</p>
                              <div className="mt-auto pt-4 flex items-end justify-between">
                                <span className="text-2xl font-black text-yellow-600">${tire.price.toFixed(2)}</span>
                                <div className="w-8 h-8 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><FaPlus size={12}/></div>
                              </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                   {/* Gallitos */}
                  {filteredTires.filter(t => t.type === 'GALLITO').length > 0 && (
                    <div>
                      <h3 className="text-xl font-black text-gray-800 border-b-2 border-gray-100 pb-3 mb-5">Gallitos</h3>
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredTires.filter(t => t.type === 'GALLITO').map((tire) => (
                           <div key={tire.id} onClick={() => handleAddToCart(tire, "TIRE")} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-gray-400 transition-all flex flex-col h-full active:scale-95 group">
                              <div className="flex justify-between items-start mb-3">
                                  <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-md">Gallito</span>
                                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">Stock: {tire.currentStock}</span>
                              </div>
                              <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-gray-600 transition-colors" title={`${tire.brand} ${tire.model}`}>{tire.brand} {tire.model}</h3>
                              <p className="text-sm text-gray-500 font-mono mt-2 bg-gray-50 p-1 rounded inline-block self-start">{tire.size}</p>
                              <div className="mt-auto pt-4 flex items-end justify-between">
                                <span className="text-2xl font-black text-gray-700">${tire.price.toFixed(2)}</span>
                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><FaPlus size={12}/></div>
                              </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "SERVICES" && (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredServices.map((service) => (
                    <div key={service.id} onClick={() => handleAddToCart(service, "SERVICE")} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-purple-300 transition-all flex flex-col h-full active:scale-95 group">
                        <div className="flex justify-between items-start mb-3">
                            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-md">{service.category || "General"}</span>
                        </div>
                        <h3 className="font-bold text-gray-800 line-clamp-3 leading-tight group-hover:text-purple-600 transition-colors" title={service.name}>{service.name}</h3>
                        <div className="mt-auto pt-4 flex items-end justify-between">
                           <span className="text-2xl font-black text-purple-600">${service.basePrice.toFixed(2)}</span>
                           <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><FaPlus size={12}/></div>
                        </div>
                    </div>
                  ))}
                </div>
              )}
           </div>
           
           {((activeTab === "TIRES" && filteredTires.length === 0) || (activeTab === "SERVICES" && filteredServices.length === 0)) && (
               <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                   <FaSearch className="text-3xl mb-2 opacity-50"/>
                   <p>No se encontraron resultados para tu búsqueda</p>
               </div>
           )}
        </div>
      </div>

      {/* RIGHT: SHOPPING CART */}
      <div className="w-[420px] bg-white flex flex-col shadow-2xl z-20 border-l border-gray-200">
        <div className="p-6 bg-white border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="font-black text-2xl text-gray-900 leading-none">Ticket</h2>
              <span className="text-sm text-gray-400 font-medium">Venta de mostrador</span>
            </div>
            <div className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-full text-sm">
                {cart.length} Artículos
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50/50">
            {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
                        <FaCompactDisc className="text-4xl" />
                    </div>
                    <p className="text-center font-medium">El carrito está vacío,<br/>selecciona productos para vender.</p>
                </div>
            ) : (
                cart.map(item => (
                    <div key={item.uid} className="flex bg-white shadow-sm border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow group relative">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-3 ${item.type === 'TIRE' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'}`}>
                            {item.type === 'TIRE' ? <FaCompactDisc size={20}/> : <FaWrench size={20}/>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1 truncate pr-6">{item.name}</h4>
                            <div className="flex justify-between items-end mt-2">
                                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                                    <button onClick={() => updateCartQuantity(item.uid, -1)} disabled={item.quantity <= 1} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-30 rounded-md transition-all"><FaMinus size={10}/></button>
                                    <span className="w-6 text-center text-sm font-black">{item.quantity}</span>
                                    <button onClick={() => updateCartQuantity(item.uid, 1)} disabled={item.type === 'TIRE' && item.quantity >= (item.maxStock || 0)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-30 rounded-md transition-all"><FaPlus size={10}/></button>
                                </div>
                                <span className="font-black text-gray-900">${item.subtotal.toFixed(2)}</span>
                            </div>
                            {item.type === 'TIRE' && item.quantity >= (item.maxStock || 0) && (
                                <span className="text-[10px] text-red-500 font-bold block mt-1 absolute bottom-2 right-3">MÁX. STOCK</span>
                            )}
                        </div>
                        <button onClick={() => removeFromCart(item.uid)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors p-1 bg-white rounded-full opacity-0 group-hover:opacity-100">
                             <FaTrash size={14} />
                        </button>
                    </div>
                ))
            )}
        </div>

        <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] relative z-10">
             <div className="flex justify-between items-center mb-3 text-gray-500 text-sm font-medium">
                 <span>Subtotal</span>
                 <span>${cartTotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center mb-6 text-gray-500 text-sm font-medium">
                 <span>IVA (0%)</span>
                 <span>$0.00</span>
             </div>
             <div className="flex justify-between items-baseline mb-6">
                 <span className="text-gray-900 font-bold">Total a cobrar</span>
                 <span className="font-black text-4xl text-gray-900 tracking-tight">${cartTotal.toFixed(2)}</span>
             </div>

             <ITButton 
               label="Proceder al Cobro" 
               color={cart.length === 0 ? "gray" : "success"}
               className={`w-full justify-center py-5 text-lg font-black tracking-wide rounded-xl transition-all ${cart.length > 0 ? 'shadow-xl shadow-green-200 hover:-translate-y-1' : ''}`}
               disabled={cart.length === 0}
               onClick={() => onCheckout(cart, cartTotal, () => setCart([]))}
             />
        </div>
      </div>
    </div>
  );
};
