import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  Home,
  LogOut,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  User,
  Users
} from "lucide-react";
import logo from "./assets/logo-escuro.png";
import { ApiError, api, subscribeRelatoriosRealtime, type Contrato, type CriarContratoPayload, type MetodoApi, type Plano, type RelatorioTarefa, type Tarefa, type UsuarioAdmin } from "./services/api";

const fallbackPlanos: Plano[] = [
  { id: "PLANO-001", nome: "Controle 10GB", tipoPlano: "Controle", franquiaInternet: "10GB", valor: 39.9, ativo: true },
  { id: "PLANO-002", nome: "Controle 20GB", tipoPlano: "Controle", franquiaInternet: "20GB", valor: 59.9, ativo: true },
  { id: "PLANO-003", nome: "Controle 30GB", tipoPlano: "Controle", franquiaInternet: "30GB", valor: 79.9, ativo: true },
  { id: "PLANO-004", nome: "Pré-pago Básico", tipoPlano: "Pré-pago", franquiaInternet: "5GB", valor: 19.9, ativo: true },
  { id: "PLANO-005", nome: "Pré-pago Turbo", tipoPlano: "Pré-pago", franquiaInternet: "15GB", valor: 29.9, ativo: true },
  { id: "PLANO-006", nome: "Pós 50GB", tipoPlano: "Pós-pago", franquiaInternet: "50GB", valor: 99.9, ativo: true },
  { id: "PLANO-007", nome: "Pós 100GB", tipoPlano: "Pós-pago", franquiaInternet: "100GB", valor: 149.9, ativo: true },
  { id: "PLANO-008", nome: "Família 80GB", tipoPlano: "Família", franquiaInternet: "80GB", valor: 129.9, ativo: true },
  { id: "PLANO-009", nome: "Família 150GB", tipoPlano: "Família", franquiaInternet: "150GB", valor: 199.9, ativo: true },
  { id: "PLANO-010", nome: "Empresarial 200GB", tipoPlano: "Empresarial", franquiaInternet: "200GB", valor: 249.9, ativo: true }
];

const fallbackContratos: Contrato[] = [
  makeContrato("CON-2025-00001", "João da Silva", "11987654321", "PLANO-002", "ATIVO", "2025-06-01T00:00:00.000Z"),
  makeContrato("CON-2025-00002", "Maria Oliveira", "11991234567", "PLANO-003", "ATIVO", "2025-05-30T00:00:00.000Z"),
  makeContrato("CON-2025-00003", "Carlos Pereira", "11995556677", "PLANO-006", "SUSPENSO", "2025-05-28T00:00:00.000Z"),
  makeContrato("CON-2025-00004", "Ana Souza", "11998687766", "PLANO-001", "ENCERRADO", "2025-05-25T00:00:00.000Z"),
  makeContrato("CON-2025-00005", "Empresa XYZ", "11990001122", "PLANO-010", "ATIVO", "2025-05-20T00:00:00.000Z")
];

function makeContrato(idContrato: string, nome: string, msisdn: string, idPlano: string, status: Contrato["status"], dataInclusao: string): Contrato {
  return {
    idContrato,
    idCliente: idContrato.replace("CON", "CLI"),
    nome,
    documento: "12345678909",
    tipoDocumento: "CPF",
    msisdn,
    iccid: "89551234123412341234",
    idPlano,
    plano: fallbackPlanos.find((plano) => plano.id === idPlano)?.nome,
    status,
    dataInclusao,
    dataEncerramento: status === "ENCERRADO" ? "2025-06-01T00:00:00.000Z" : null
  };
}

type Page = "dashboard" | "clientes" | "contratos" | "novo" | "detalhes" | "planos" | "usuarios" | "relatorios";

type Session = {
  usuario: string;
  perfil: string;
};

const nav: Array<{ page: Page; label: string; icon: typeof Home; adminOnly?: boolean }> = [
  { page: "dashboard", label: "Dashboard", icon: Home },
  { page: "clientes", label: "Clientes", icon: Users },
  { page: "contratos", label: "Contratos", icon: FileText },
  { page: "planos", label: "Planos", icon: ClipboardList },
  { page: "relatorios", label: "Relatórios", icon: BarChart3, adminOnly: true },
  { page: "usuarios", label: "Logins", icon: Settings, adminOnly: true }
];

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("escuro.token") ?? "");
  const [session, setSession] = useState<Session>({
    usuario: localStorage.getItem("escuro.usuario") ?? "",
    perfil: localStorage.getItem("escuro.perfil") ?? ""
  });
  const [page, setPage] = useState<Page>(token ? "dashboard" : "dashboard");
  const [planos, setPlanos] = useState<Plano[]>(fallbackPlanos);
  const [contratos, setContratos] = useState<Contrato[]>(fallbackContratos);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [metodos, setMetodos] = useState<MetodoApi[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [relatorios, setRelatorios] = useState<RelatorioTarefa[]>([]);
  const [selected, setSelected] = useState<Contrato>(fallbackContratos[0]);
  const [notice, setNotice] = useState("");

  const logged = Boolean(token);
  const isAdmin = session.perfil === "ADMIN";

  async function loadAdminData(currentToken = token) {
    const [usuariosApi, metodosApi, tarefasApi, relatoriosApi] = await Promise.allSettled([
      api.usuarios(currentToken),
      api.metodos(currentToken),
      api.tarefas(currentToken),
      api.relatorios(currentToken)
    ]);

    if (usuariosApi.status === "fulfilled") setUsuarios(usuariosApi.value);
    if (metodosApi.status === "fulfilled") setMetodos(metodosApi.value);
    if (tarefasApi.status === "fulfilled") setTarefas(tarefasApi.value);
    if (relatoriosApi.status === "fulfilled") setRelatorios(relatoriosApi.value);

    const failed = [usuariosApi, metodosApi, tarefasApi, relatoriosApi].some((result) => result.status === "rejected");
    if (failed) {
      setNotice("Algumas informações administrativas não foram carregadas. Tente atualizar o relatório.");
    }
  }

  async function loadData(currentToken = token) {
    if (!currentToken) return;
    try {
      const profile = await api.validate(currentToken);
      const currentSession = {
        usuario: profile.usuario ?? session.usuario,
        perfil: profile.perfil ?? session.perfil
      };
      setSession(currentSession);
      localStorage.setItem("escuro.usuario", currentSession.usuario);
      localStorage.setItem("escuro.perfil", currentSession.perfil);

      const [planosApi, contratosApi] = await Promise.all([api.planos(currentToken), api.contratos(currentToken)]);
      setPlanos(planosApi.length ? planosApi : fallbackPlanos);
      setContratos(contratosApi.length ? contratosApi : fallbackContratos);
      if (contratosApi[0]) setSelected(contratosApi[0]);

      if (currentSession.perfil === "ADMIN") {
        await loadAdminData(currentToken);
      }
    } catch {
      setNotice("API indisponível ou sessão expirada. Exibindo dados de demonstração.");
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!token || !isAdmin || page !== "relatorios") return;

    let closed = false;
    let refreshTimer: number | undefined;

    const refreshReports = () => {
      if (closed) return;
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        if (!closed) void loadAdminData(token);
      }, 250);
    };

    const unsubscribe = subscribeRelatoriosRealtime(
      token,
      refreshReports,
      () => {
        if (!closed) {
          setNotice("Atualização em tempo real indisponível. O painel continuará verificando periodicamente.");
        }
      }
    );

    const fallbackPolling = window.setInterval(() => {
      if (!closed) void loadAdminData(token);
    }, 10000);

    return () => {
      closed = true;
      unsubscribe();
      if (refreshTimer) window.clearTimeout(refreshTimer);
      window.clearInterval(fallbackPolling);
    };
  }, [token, isAdmin, page]);

  async function handleLogin(usuario: string, senha: string) {
    try {
      const result = await api.token({ usuario, senha, clientId: "escuro-web", clientSecret: "escuro-secret" });
      const currentSession = {
        usuario: result.usuario ?? usuario,
        perfil: result.perfil ?? ""
      };
      localStorage.setItem("escuro.token", result.accessToken);
      localStorage.setItem("escuro.usuario", currentSession.usuario);
      localStorage.setItem("escuro.perfil", currentSession.perfil);
      setToken(result.accessToken);
      setSession(currentSession);
      setPage("dashboard");
      setNotice("Login realizado com sucesso.");
      await loadData(result.accessToken);
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "Não foi possível fazer login.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("escuro.token");
    localStorage.removeItem("escuro.usuario");
    localStorage.removeItem("escuro.perfil");
    setToken("");
    setSession({ usuario: "", perfil: "" });
    setNotice("");
  }

  async function handleCreate(payload: CriarContratoPayload) {
    try {
      const result = await api.criarContrato(token, payload);
      setNotice(result.message);
      await loadData();
      setPage("contratos");
    } catch (error) {
      if (error instanceof ApiError) {
        setNotice(error.message);
      } else {
        setNotice("Não foi possível salvar o contrato.");
      }
    }
  }

  async function handleCloseContract(idContrato: string) {
    try {
      await api.encerrarContrato(token, idContrato);
      setNotice("Contrato encerrado com sucesso.");
      await loadData();
      setPage("contratos");
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "Não foi possível encerrar o contrato.");
    }
  }

  async function handleSaveUsuario(payload: { id?: string; usuario: string; senha: string; perfil: string; ativo: boolean }) {
    try {
      if (payload.id) {
        const updatePayload = {
          usuario: payload.usuario,
          perfil: payload.perfil,
          ativo: payload.ativo,
          ...(payload.senha ? { senha: payload.senha } : {})
        };
        await api.atualizarUsuario(token, payload.id, updatePayload);
        setNotice("Login alterado com sucesso.");
      } else {
        await api.criarUsuario(token, payload);
        setNotice("Login criado com sucesso.");
      }
      await loadAdminData(token);
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "Não foi possível salvar o login.");
    }
  }

  async function handleDeleteUsuario(id: string) {
    try {
      await api.removerUsuario(token, id);
      setNotice("Login excluído logicamente. O histórico foi preservado.");
      await loadAdminData(token);
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "Não foi possível excluir o login.");
    }
  }

  async function handleCreateTarefa(payload: { titulo: string; usuarioId: string; ordemObrigatoria: boolean; itens: Array<{ codigoMetodo: string; statusEsperado: number }> }) {
    try {
      await api.criarTarefa(token, payload);
      setNotice("Tarefa criada com sucesso.");
      await loadAdminData(token);
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "Não foi possível criar a tarefa.");
    }
  }

  async function handleDeleteTarefa(id: string) {
    try {
      await api.removerTarefa(token, id);
      setNotice("Tarefa removida do relatório ativo.");
      await loadAdminData(token);
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "Não foi possível remover a tarefa.");
    }
  }

  if (!logged) {
    return <LoginScreen onLogin={handleLogin} notice={notice} />;
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} onLogout={handleLogout} isAdmin={isAdmin} />
      <main className="main-area">
        <Topbar session={session} />
        {notice && <div className="notice">{notice}</div>}
        {page === "dashboard" && <Dashboard contratos={contratos} planos={planos} setPage={setPage} setSelected={setSelected} />}
        {page === "clientes" && <Clientes contratos={contratos} />}
        {page === "contratos" && <Contratos contratos={contratos} setPage={setPage} setSelected={setSelected} />}
        {page === "novo" && <NovoContrato planos={planos} onCreate={handleCreate} />}
        {page === "detalhes" && <Detalhes contrato={selected} onCloseContract={handleCloseContract} />}
        {page === "planos" && <Planos planos={planos} />}
        {page === "usuarios" && isAdmin && <AdminUsuarios usuarios={usuarios} onSave={handleSaveUsuario} onDelete={handleDeleteUsuario} />}
        {page === "relatorios" && isAdmin && <Relatorios usuarios={usuarios} metodos={metodos} tarefas={tarefas} relatorios={relatorios} onCreateTarefa={handleCreateTarefa} onDeleteTarefa={handleDeleteTarefa} onRefresh={() => loadAdminData(token)} />}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin, notice }: { onLogin: (usuario: string, senha: string) => Promise<void>; notice: string }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!usuario.trim() || !senha) return;
    setLoading(true);
    try {
      await onLogin(usuario, senha);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-layout">
      <aside className="brand-rail">
        <BrandMark large />
        <span>Versão 1.0.0</span>
      </aside>
      <section className="login-panel">
        <div className="panel compact">
          <h1>Login</h1>
          <p>Entre com seu usuário e senha para acessar o painel Escuro.</p>
          <Field label="Usuário*" value={usuario} onChange={setUsuario} placeholder="Digite seu login" />
          <Field label="Senha*" value={senha} onChange={setSenha} type="password" placeholder="Digite sua senha" />
          <button className="primary wide" onClick={submit} disabled={loading || !usuario.trim() || !senha}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
          {notice && <div className="token-box">{notice}</div>}
        </div>
      </section>
    </div>
  );
}

function Sidebar({ page, setPage, onLogout, isAdmin }: { page: Page; setPage: (page: Page) => void; onLogout: () => void; isAdmin: boolean }) {
  return (
    <aside className="sidebar">
      <BrandMark />
      <nav>
        {nav.filter((item) => !item.adminOnly || isAdmin).map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} className={page === item.page ? "active" : ""} onClick={() => setPage(item.page)}>
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <button className="logout" onClick={onLogout}>
        <LogOut size={17} />
        Sair
      </button>
      <div className="sidebar-version">
        <strong>ESCURO</strong>
        <span>TELECOM</span>
        <small>Versão 1.0.0</small>
      </div>
    </aside>
  );
}

function BrandMark({ large = false }: { large?: boolean }) {
  return (
    <div className={`brand-mark ${large ? "large" : ""}`}>
      <img src={logo} alt="" />
      <div>
        <strong>ESCURO</strong>
        <span>TELECOM</span>
      </div>
    </div>
  );
}

function Topbar({ session }: { session: Session }) {
  return (
    <header className="topbar">
      <div />
      <div className="operator">
        <div className="bell">
          <Bell size={18} />
          <span>3</span>
        </div>
        <div>
          <strong>{session.usuario || "Operador"}</strong>
          <small>{session.perfil || "Online"}</small>
        </div>
        <div className="avatar">
          <User size={19} />
        </div>
      </div>
    </header>
  );
}

function Dashboard({ contratos, planos, setPage, setSelected }: { contratos: Contrato[]; planos: Plano[]; setPage: (page: Page) => void; setSelected: (contrato: Contrato) => void }) {
  const ativos = contratos.filter((contrato) => contrato.status === "ATIVO").length;
  const encerrados = contratos.filter((contrato) => contrato.status === "ENCERRADO").length;
  return (
    <section>
      <PageTitle title="Dashboard" subtitle="Resumo operacional do atendimento." />
      <div className="metrics">
        <Metric icon={ShieldCheck} label="Contratos ativos" value={ativos} />
        <Metric icon={Plus} label="Criados no dia" value={contratos.length} />
        <Metric icon={CheckCircle2} label="Encerrados" value={encerrados} />
        <Metric icon={Smartphone} label="Planos disponíveis" value={planos.filter((plano) => plano.ativo).length} />
      </div>
      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Últimos contratos</h2>
            <p>Contratos mais recentes cadastrados na operação.</p>
          </div>
          <button className="primary" onClick={() => setPage("novo")}>
            <Plus size={16} />
            Novo Contrato
          </button>
        </div>
        <ContractTable contratos={contratos.slice(0, 5)} onView={(contrato) => { setSelected(contrato); setPage("detalhes"); }} />
      </div>
    </section>
  );
}

function Clientes({ contratos }: { contratos: Contrato[] }) {
  const clientes = useMemo(() => Array.from(new Map(contratos.map((contrato) => [contrato.documento, contrato])).values()), [contratos]);
  return (
    <section>
      <PageTitle title="Clientes" subtitle="Clientes vinculados aos contratos cadastrados." />
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>ID do Cliente</th>
              <th>Nome</th>
              <th>Documento</th>
              <th>Linhas</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.idCliente}>
                <td>{cliente.idCliente}</td>
                <td>{cliente.nome}</td>
                <td>{cliente.documento}</td>
                <td>{contratos.filter((contrato) => contrato.documento === cliente.documento).length}</td>
                <td><Badge status={cliente.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Contratos({ contratos, setPage, setSelected }: { contratos: Contrato[]; setPage: (page: Page) => void; setSelected: (contrato: Contrato) => void }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos os Status");
  const filtered = contratos.filter((contrato) => {
    const haystack = `${contrato.idContrato} ${contrato.nome} ${contrato.msisdn} ${contrato.documento}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) && (status === "Todos os Status" || contrato.status === status);
  });
  return (
    <section>
      <div className="page-title inline">
        <div>
          <h1>Contratos</h1>
          <p>Consulte e gerencie os contratos.</p>
        </div>
        <button className="primary" onClick={() => setPage("novo")}>
          <Plus size={16} />
          Novo Contrato
        </button>
      </div>
      <div className="panel">
        <div className="filters">
          <div className="search">
            <Search size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar contrato..." />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>Todos os Status</option>
            <option>ATIVO</option>
            <option>SUSPENSO</option>
            <option>ENCERRADO</option>
            <option>CANCELADO</option>
          </select>
        </div>
        <ContractTable contratos={filtered} onView={(contrato) => { setSelected(contrato); setPage("detalhes"); }} />
      </div>
    </section>
  );
}

function NovoContrato({ planos, onCreate }: { planos: Plano[]; onCreate: (payload: CriarContratoPayload) => Promise<void> }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    idCliente: "CLI-001",
    tipoDocumento: "CPF" as "CPF" | "CNPJ",
    documento: "12345678909",
    nome: "João da Silva",
    msisdn: "11987654321",
    iccid: "89551234123412341234",
    idPlano: "PLANO-002",
    dataInclusao: today,
    dataEncerramento: "",
    status: "ATIVO"
  });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <section>
      <PageTitle title="Novo Contrato / Inclusão de Plano" subtitle="Contratos > Novo Contrato" />
      <div className="panel form-panel">
        <SectionTitle>Dados do Cliente</SectionTitle>
        <div className="grid four">
          <Field label="ID do Cliente*" value={form.idCliente} onChange={(value) => update("idCliente", value)} />
          <SelectField label="Tipo de Documento" value={form.tipoDocumento} onChange={(value) => update("tipoDocumento", value)} options={["CPF", "CNPJ"]} />
          <Field label="Documento*" value={form.documento} onChange={(value) => update("documento", value)} icon={Search} />
          <Field label="Nome / Razão Social*" value={form.nome} onChange={(value) => update("nome", value)} />
        </div>
        <SectionTitle>Dados da Linha</SectionTitle>
        <div className="grid four">
          <Field label="MSISDN (Número da Linha)*" value={form.msisdn} onChange={(value) => update("msisdn", value)} />
          <Field label="ICCID (Chip)*" value={form.iccid} onChange={(value) => update("iccid", value)} />
          <SelectField label="Tipo de Linha" value="Móvel" onChange={() => undefined} options={["Móvel"]} />
          <Field label="Título da Linha (Opcional)" value="" onChange={() => undefined} placeholder="Ex: João Principal" />
        </div>
        <SectionTitle>Dados do Plano</SectionTitle>
        <div className="grid three">
          <SelectField label="Plano*" value={form.idPlano} onChange={(value) => update("idPlano", value)} options={planos.map((plano) => plano.id)} render={(id) => `${id} - ${planos.find((plano) => plano.id === id)?.nome ?? ""}`} />
          <Field label="Data de Inclusão" value={form.dataInclusao} onChange={(value) => update("dataInclusao", value)} type="date" icon={Calendar} />
          <Field label="Data de Encerramento (Opcional)" value={form.dataEncerramento} onChange={(value) => update("dataEncerramento", value)} type="date" icon={Calendar} />
        </div>
        <SectionTitle>Dados do Contrato</SectionTitle>
        <div className="grid two compact-grid">
          <Field label="ID do Contrato (Opcional)" value="" onChange={() => undefined} placeholder="Deixe em branco para gerar automático" />
          <SelectField label="Status" value={form.status} onChange={(value) => update("status", value)} options={["ATIVO", "SUSPENSO", "ENCERRADO", "CANCELADO"]} />
        </div>
        <div className="form-actions">
          <button className="secondary" onClick={() => setForm((current) => ({ ...current, documento: "", msisdn: "", iccid: "" }))}>Limpar</button>
          <button className="primary" onClick={() => onCreate({
            ...form,
            dataInclusao: form.dataInclusao ? new Date(form.dataInclusao).toISOString() : undefined,
            dataEncerramento: form.dataEncerramento ? new Date(form.dataEncerramento).toISOString() : undefined
          })}>Salvar Contrato</button>
        </div>
      </div>
    </section>
  );
}

function Detalhes({ contrato, onCloseContract }: { contrato: Contrato; onCloseContract: (idContrato: string) => void }) {
  return (
    <section>
      <div className="page-title inline">
        <div>
          <h1>Detalhes do Contrato</h1>
          <p>Contratos &gt; Detalhes do Contrato</p>
        </div>
        <button className="primary danger" onClick={() => onCloseContract(contrato.idContrato)}>Encerrar Contrato</button>
      </div>
      <div className="details-grid">
        <InfoCard title="Dados do Cliente" rows={[
          ["Tipo de Documento", contrato.tipoDocumento ?? "CPF"],
          ["Documento", contrato.documento ?? "-"],
          ["Nome", contrato.nome ?? "-"]
        ]} />
        <InfoCard title="Dados da Linha" rows={[
          ["MSISDN", contrato.msisdn],
          ["ICCID", contrato.iccid],
          ["Tipo de Linha", "Móvel"]
        ]} />
        <InfoCard title="Dados do Plano" rows={[
          ["Plano", `${contrato.idPlano} - ${contrato.plano ?? ""}`],
          ["Internet", planoInternet(contrato.idPlano)],
          ["Tipo", "Operacional"]
        ]} />
        <InfoCard title="Dados do Contrato" rows={[
          ["ID do Contrato", contrato.idContrato],
          ["Status", contrato.status],
          ["Data de Inclusão", formatDate(contrato.dataInclusao)],
          ["Data de Encerramento", contrato.dataEncerramento ? formatDate(contrato.dataEncerramento) : "-"]
        ]} />
      </div>
    </section>
  );
}

function Planos({ planos }: { planos: Plano[] }) {
  return (
    <section>
      <div className="page-title inline">
        <div>
          <h1>Planos</h1>
          <p>Consulte os planos disponíveis.</p>
        </div>
      </div>
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>ID do Plano</th>
              <th>Nome do Plano</th>
              <th>Tipo</th>
              <th>Dados (Internet)</th>
              <th>Valor (R$)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {planos.map((plano) => (
              <tr key={plano.id}>
                <td>{plano.id}</td>
                <td>{plano.nome}</td>
                <td>{plano.tipoPlano}</td>
                <td>{plano.franquiaInternet}</td>
                <td>{money(plano.valor)}</td>
                <td><Badge status={plano.ativo ? "ATIVO" : "ENCERRADO"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}


function AdminUsuarios({
  usuarios,
  onSave,
  onDelete
}: {
  usuarios: UsuarioAdmin[];
  onSave: (payload: { id?: string; usuario: string; senha: string; perfil: string; ativo: boolean }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const emptyForm = { id: "", usuario: "", senha: "", perfil: "USUARIO", ativo: true };
  const [form, setForm] = useState(emptyForm);
  const editing = Boolean(form.id);
  const update = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  async function submit() {
    await onSave({
      id: form.id || undefined,
      usuario: form.usuario,
      senha: form.senha,
      perfil: form.perfil,
      ativo: form.ativo
    });
    setForm(emptyForm);
  }

  return (
    <section>
      <PageTitle title="Logins" subtitle="Administrador cria, altera e exclui logins." />
      <div className="panel form-panel">
        <SectionTitle>{editing ? "Alterar Login" : "Criar Login"}</SectionTitle>
        <div className="grid four">
          <Field label="Nome do login*" value={form.usuario} onChange={(value) => update("usuario", value)} placeholder="ex: tester.escuro" />
          <Field label={editing ? "Nova senha (opcional)" : "Senha*"} value={form.senha} onChange={(value) => update("senha", value)} type="password" />
          <SelectField label="Perfil" value={form.perfil} onChange={(value) => update("perfil", value)} options={["ADMIN", "ATENDENTE", "USUARIO", "DEVELOPER"]} />
          <SelectField label="Status" value={form.ativo ? "ATIVO" : "INATIVO"} onChange={(value) => update("ativo", value === "ATIVO")} options={["ATIVO", "INATIVO"]} />
        </div>
        <div className="form-actions">
          <button className="secondary" onClick={() => setForm(emptyForm)}>Limpar</button>
          <button className="primary" onClick={submit}>{editing ? "Salvar Alterações" : "Criar Login"}</button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Logins cadastrados</h2>
            <p>Excluir desativa o acesso e preserva logs e relatórios.</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Login</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.usuario}</td>
                <td>{usuario.perfil}</td>
                <td><Badge status={usuario.ativo ? "ATIVO" : "ENCERRADO"} /></td>
                <td>{formatDate(usuario.createdAt)}</td>
                <td className="actions text-actions">
                  <button className="secondary small" onClick={() => setForm({ id: usuario.id, usuario: usuario.usuario, senha: "", perfil: usuario.perfil, ativo: usuario.ativo })}>Editar</button>
                  <button className="secondary danger-text small" onClick={() => onDelete(usuario.id)} disabled={!usuario.ativo}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Relatorios({
  usuarios,
  metodos,
  tarefas,
  relatorios,
  onCreateTarefa,
  onDeleteTarefa,
  onRefresh
}: {
  usuarios: UsuarioAdmin[];
  metodos: MetodoApi[];
  tarefas: Tarefa[];
  relatorios: RelatorioTarefa[];
  onCreateTarefa: (payload: { titulo: string; usuarioId: string; ordemObrigatoria: boolean; itens: Array<{ codigoMetodo: string; statusEsperado: number }> }) => Promise<void>;
  onDeleteTarefa: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}) {
  const usuariosAtivos = usuarios.filter((usuario) => usuario.ativo && usuario.perfil !== "ADMIN");
  const [titulo, setTitulo] = useState("Fluxo de testes da API");
  const [usuarioId, setUsuarioId] = useState(usuariosAtivos[0]?.id ?? "");
  const [ordemObrigatoria, setOrdemObrigatoria] = useState(true);
  const [codigoMetodo, setCodigoMetodo] = useState(metodos[0]?.codigo ?? "");
  const [statusEsperado, setStatusEsperado] = useState("200");
  const [itens, setItens] = useState<Array<{ codigoMetodo: string; statusEsperado: number }>>([]);

  useEffect(() => {
    if (!usuarioId && usuariosAtivos[0]) setUsuarioId(usuariosAtivos[0].id);
  }, [usuariosAtivos, usuarioId]);

  useEffect(() => {
    if (!codigoMetodo && metodos[0]) setCodigoMetodo(metodos[0].codigo);
  }, [metodos, codigoMetodo]);

  const metodoSelecionado = metodos.find((metodo) => metodo.codigo === codigoMetodo);
  const resumoGeral = relatorios.reduce((acc, relatorio) => ({
    total: acc.total + relatorio.resumo.total,
    acertos: acc.acertos + relatorio.resumo.acertos,
    erros: acc.erros + relatorio.resumo.erros,
    pendentes: acc.pendentes + relatorio.resumo.pendentes,
    logsFora: acc.logsFora + (relatorio.tentativasInvalidas?.length ?? relatorio.logsForaDaTarefa.length)
  }), { total: 0, acertos: 0, erros: 0, pendentes: 0, logsFora: 0 });
  const totalAvaliado = resumoGeral.total || 1;
  const taxaAcerto = Math.round((resumoGeral.acertos / totalAvaliado) * 100);
  const taxaExecucao = Math.round(((resumoGeral.acertos + resumoGeral.erros) / totalAvaliado) * 100);

  function addItem() {
    const expected = Number(statusEsperado);
    if (!codigoMetodo || !Number.isInteger(expected)) return;
    setItens((current) => [...current, { codigoMetodo, statusEsperado: expected }]);
  }

  async function submit() {
    await onCreateTarefa({ titulo, usuarioId, ordemObrigatoria, itens });
    setItens([]);
  }

  return (
    <section>
      <div className="page-title inline">
        <div>
          <h1>Relatórios</h1>
          <p>Administração de tarefas, ordem de métodos e validação por status code. O painel atualiza automaticamente quando o usuário faz uma request.</p>
        </div>
        <div className="actions text-actions">
          <button className="secondary" onClick={onRefresh}>Atualizar relatório</button>
          <button className="primary" onClick={() => exportRelatoriosExcel(relatorios)} disabled={relatorios.length === 0}>Exportar Excel</button>
        </div>
      </div>

      <div className="panel report-analytics">
        <div>
          <h2>Análise geral das tarefas</h2>
          <p>Comparativo consolidado dos métodos esperados pelo administrador e dos logs registrados pelos usuários.</p>
        </div>
        <div className="analysis-cards">
          <span><strong>{resumoGeral.total}</strong> itens avaliados</span>
          <span><strong>{resumoGeral.acertos}</strong> acertos</span>
          <span><strong>{resumoGeral.erros}</strong> erros</span>
          <span><strong>{resumoGeral.pendentes}</strong> pendentes</span>
          <span><strong>{taxaAcerto}%</strong> taxa de acerto</span>
          <span><strong>{taxaExecucao}%</strong> execução</span>
        </div>
        <div className="chart-box" aria-label="Gráfico de acertos, erros e pendências">
          <ChartBar label="Acertos" value={resumoGeral.acertos} total={totalAvaliado} />
          <ChartBar label="Erros" value={resumoGeral.erros} total={totalAvaliado} />
          <ChartBar label="Pendentes" value={resumoGeral.pendentes} total={totalAvaliado} />
        </div>
        {resumoGeral.logsFora > 0 && <p className="analysis-note">Existem {resumoGeral.logsFora} tentativas inválidas. Elas são contabilizadas como erro e ficam listadas em cada relatório para auditoria.</p>}
      </div>

      <div className="panel form-panel">
        <SectionTitle>Criar tarefa para usuário</SectionTitle>
        <div className="grid four">
          <Field label="Título da tarefa" value={titulo} onChange={setTitulo} />
          <SelectField label="Usuário" value={usuarioId} onChange={setUsuarioId} options={usuariosAtivos.map((usuario) => usuario.id)} render={(id) => usuariosAtivos.find((usuario) => usuario.id === id)?.usuario ?? id} />
          <SelectField label="Ordem" value={ordemObrigatoria ? "OBRIGATORIA" : "LIVRE"} onChange={(value) => setOrdemObrigatoria(value === "OBRIGATORIA")} options={["OBRIGATORIA", "LIVRE"]} render={(value) => value === "OBRIGATORIA" ? "Seguir ordem definida" : "Sem ordem obrigatória"} />
          <Field label="Status esperado" value={statusEsperado} onChange={setStatusEsperado} type="number" />
        </div>
        <div className="grid two compact-grid">
          <SelectField label="Método da API" value={codigoMetodo} onChange={setCodigoMetodo} options={metodos.map((metodo) => metodo.codigo)} render={(codigo) => {
            const metodo = metodos.find((item) => item.codigo === codigo);
            return metodo ? `${metodo.metodo} ${metodo.descricao}` : codigo;
          }} />
          <div className="method-preview">
            <strong>{metodoSelecionado?.metodo ?? "-"}</strong>
            <span>{metodoSelecionado?.endpoint ?? "Selecione um método"}</span>
          </div>
        </div>
        <div className="form-actions">
          <button className="secondary" onClick={addItem}>Adicionar método na ordem</button>
          <button className="primary" onClick={submit} disabled={!usuarioId || itens.length === 0}>Salvar Tarefa</button>
        </div>
        {itens.length > 0 && (
          <div className="selected-methods">
            {itens.map((item, index) => {
              const metodo = metodos.find((value) => value.codigo === item.codigoMetodo);
              return (
                <span key={`${item.codigoMetodo}-${index}`}>
                  {index + 1}. {metodo?.metodo} {metodo?.endpoint} → {item.statusEsperado}
                  <button type="button" aria-label="Remover método da tarefa" onClick={() => setItens((current) => current.filter((_, itemIndex) => itemIndex !== index))}>×</button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Tarefas criadas</h2>
            <p>O relatório compara os logs do usuário com os métodos e status esperados.</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Tarefa</th>
              <th>Usuário</th>
              <th>Ordem</th>
              <th>Métodos</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tarefas.map((tarefa) => (
              <tr key={tarefa.id}>
                <td>{tarefa.titulo}</td>
                <td>{tarefa.usuario}</td>
                <td>{tarefa.ordemObrigatoria ? "Obrigatória" : "Livre"}</td>
                <td>{tarefa.itens.length}</td>
                <td><Badge status={tarefa.ativo ? "ATIVO" : "ENCERRADO"} /></td>
                <td className="actions text-actions">
                  <button className="secondary danger-text small" onClick={() => onDeleteTarefa(tarefa.id)} disabled={!tarefa.ativo}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="reports-grid">
        {relatorios.map((relatorio) => (
          <div className="panel report-card" key={relatorio.tarefa.id}>
            <div className="panel-head compact-head">
              <div>
                <h2>{relatorio.tarefa.titulo}</h2>
                <p>{relatorio.tarefa.usuario} • {relatorio.tarefa.ordemObrigatoria ? "ordem obrigatória" : "ordem livre"}</p>
              </div>
              <Badge status={relatorio.resumo.aprovada ? "ACERTOU" : relatorio.resumo.erros > 0 ? "ERROU" : relatorio.resumo.pendentes ? "PENDENTE" : "ERROU"} />
            </div>
            <div className="report-summary">
              <span><strong>{relatorio.resumo.acertos}</strong> acertos</span>
              <span><strong>{relatorio.resumo.erros}</strong> erros</span>
              <span><strong>{relatorio.resumo.pendentes}</strong> pendentes</span>
              <span><strong>{Math.round((relatorio.resumo.acertos / (relatorio.resumo.total || 1)) * 100)}%</strong> aproveitamento</span>
              <span><strong>{relatorio.tentativasInvalidas?.length ?? relatorio.logsForaDaTarefa.length}</strong> tentativas inválidas</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Ordem</th>
                  <th>Método</th>
                  <th>Esperado</th>
                  <th>Obtido</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.resultados.map((resultado) => (
                  <tr key={resultado.item.id}>
                    <td>{resultado.item.ordem}</td>
                    <td>
                      <strong>{resultado.item.metodo} {resultado.item.endpoint}</strong>
                      <small>{resultado.motivo}</small>
                    </td>
                    <td>{resultado.statusEsperado}</td>
                    <td>{resultado.statusObtido ?? "-"}</td>
                    <td><Badge status={resultado.status.toUpperCase()} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(relatorio.tentativasInvalidas?.length ?? 0) > 0 && (
              <div className="invalid-attempts">
                <h3>Tentativas inválidas contabilizadas como erro</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Execução</th>
                      <th>Executado</th>
                      <th>Esperado no momento</th>
                      <th>Status</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.tentativasInvalidas?.map((tentativa) => (
                      <tr key={tentativa.id}>
                        <td>{tentativa.ordemExecucao}</td>
                        <td><strong>{tentativa.metodo} {tentativa.endpoint}</strong></td>
                        <td>{tentativa.itemEsperado ? `${tentativa.itemEsperado.metodo} ${tentativa.itemEsperado.endpoint}` : "-"}</td>
                        <td>{tentativa.statusObtido}</td>
                        <td><small>{tentativa.motivo}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ChartBar({ label, value, total }: { label: string; value: number; total: number }) {
  const width = value > 0 ? `${Math.max(4, Math.round((value / total) * 100))}%` : "0%";
  return (
    <div className="chart-row">
      <span>{label}</span>
      <div className="chart-track">
        <div className="chart-fill" style={{ width }} />
      </div>
      <strong>{value}</strong>
    </div>
  );
}

function exportRelatoriosExcel(relatorios: RelatorioTarefa[]) {
  const rows = relatorios.flatMap((relatorio) => {
    const resultados = relatorio.resultados.map((resultado) => ({
      tarefa: relatorio.tarefa.titulo,
      usuario: relatorio.tarefa.usuario,
      ordemObrigatoria: relatorio.tarefa.ordemObrigatoria ? "Sim" : "Não",
      tipo: "Método esperado",
      ordem: resultado.item.ordem,
      metodo: resultado.item.metodo,
      endpoint: resultado.item.endpoint,
      esperado: resultado.statusEsperado,
      obtido: resultado.statusObtido ?? "",
      resultado: resultado.status,
      motivo: resultado.motivo,
      dataExecucao: resultado.log?.createdAt ? formatDateTime(resultado.log.createdAt) : ""
    }));

    const invalidas = (relatorio.tentativasInvalidas ?? []).map((tentativa) => ({
      tarefa: relatorio.tarefa.titulo,
      usuario: relatorio.tarefa.usuario,
      ordemObrigatoria: relatorio.tarefa.ordemObrigatoria ? "Sim" : "Não",
      tipo: "Tentativa inválida",
      ordem: tentativa.ordemExecucao,
      metodo: tentativa.metodo,
      endpoint: tentativa.endpoint,
      esperado: tentativa.itemEsperado ? `${tentativa.itemEsperado.metodo} ${tentativa.itemEsperado.endpoint}` : "",
      obtido: tentativa.statusObtido,
      resultado: "errou",
      motivo: tentativa.motivo,
      dataExecucao: tentativa.log?.createdAt ? formatDateTime(tentativa.log.createdAt) : ""
    }));

    return [...resultados, ...invalidas];
  });

  const header = ["Tarefa", "Usuário", "Ordem obrigatória", "Tipo", "Ordem/Execução", "Método", "Endpoint", "Esperado", "Obtido", "Resultado", "Motivo", "Data da execução"];
  const htmlRows = [
    `<tr>${header.map((value) => `<th>${escapeHtml(value)}</th>`).join("")}</tr>`,
    ...rows.map((row) => `<tr>${Object.values(row).map((value) => `<td>${escapeHtml(String(value))}</td>`).join("")}</tr>`)
  ];

  const html = `
    <html>
      <head><meta charset="utf-8" /></head>
      <body>
        <table>${htmlRows.join("")}</table>
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `relatorio-tarefas-escuro-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    "\"": "&quot;"
  }[char] ?? char));
}

function ContractTable({ contratos, onView }: { contratos: Contrato[]; onView: (contrato: Contrato) => void }) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID do Contrato</th>
          <th>Cliente</th>
          <th>MSISDN</th>
          <th>Plano</th>
          <th>Status</th>
          <th>Data Inclusão</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {contratos.map((contrato) => (
          <tr key={contrato.idContrato}>
            <td>{contrato.idContrato}</td>
            <td>{contrato.nome}</td>
            <td>{contrato.msisdn}</td>
            <td>{contrato.idPlano}</td>
            <td><Badge status={contrato.status} /></td>
            <td>{formatDate(contrato.dataInclusao)}</td>
            <td className="actions">
              <IconButton icon={Eye} label="Ver detalhes" onClick={() => onView(contrato)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="page-title">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className="section-title">{children}</h2>;
}

function Field({ label, value, onChange, placeholder, type = "text", icon: Icon }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; icon?: typeof Search }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-wrap">
        <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
        {Icon && <Icon size={15} />}
      </div>
    </label>
  );
}

function SelectField({ label, value, onChange, options, render }: { label: string; value: string; onChange: (value: string) => void; options: string[]; render?: (value: string) => string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{render ? render(option) : option}</option>)}
      </select>
    </label>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Home; label: string; value: number }) {
  return (
    <div className="metric">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  return <span className={`badge ${status.toLowerCase()}`}>{status}</span>;
}

function IconButton({ icon: Icon, label, onClick }: { icon: typeof Eye; label: string; onClick?: () => void }) {
  return (
    <button className="icon-btn" aria-label={label} title={label} onClick={onClick}>
      <Icon size={15} />
    </button>
  );
}

function InfoCard({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="info-card">
      <h2>{title}</h2>
      {rows.map(([label, value]) => (
        <div className="info-row" key={label}>
          <span>{label}</span>
          {label === "Status" ? <Badge status={value} /> : <strong>{value}</strong>}
        </div>
      ))}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function money(value: number | null) {
  return (value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function planoInternet(idPlano: string) {
  return fallbackPlanos.find((plano) => plano.id === idPlano)?.franquiaInternet ?? "-";
}
