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
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  User,
  Users
} from "lucide-react";
import logo from "./assets/logo-escuro.png";
import { ApiError, api, type Contrato, type CriarContratoPayload, type Plano } from "./services/api";

type Page = "dashboard" | "clientes" | "contratos" | "novo" | "detalhes" | "planos";

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
  makeContrato("CON-2025-00001", "Cliente Exemplo", "11987654321", "PLANO-002", "ATIVO", "2025-06-01T00:00:00.000Z"),
  makeContrato("CON-2025-00002", "Pessoa Exemplo", "1199demo-password7", "PLANO-003", "ATIVO", "2025-05-30T00:00:00.000Z"),
  makeContrato("CON-2025-00003", "Carlos Pereira", "11995556677", "PLANO-006", "SUSPENSO", "2025-05-28T00:00:00.000Z"),
  makeContrato("CON-2025-00004", "Ana Souza", "11998687766", "PLANO-001", "ENCERRADO", "2025-05-25T00:00:00.000Z"),
  makeContrato("CON-2025-00005", "Empresa XYZ", "11990001122", "PLANO-010", "ATIVO", "2025-05-20T00:00:00.000Z")
];

function makeContrato(idContrato: string, nome: string, msisdn: string, idPlano: string, status: Contrato["status"], dataInclusao: string): Contrato {
  return {
    idContrato,
    idCliente: idContrato.replace("CON", "CLI"),
    nome,
    documento: "00000000191",
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

const nav = [
  { page: "dashboard" as const, label: "Dashboard", icon: Home },
  { page: "clientes" as const, label: "Clientes", icon: Users },
  { page: "contratos" as const, label: "Contratos", icon: FileText },
  { page: "planos" as const, label: "Planos", icon: ClipboardList },
  { page: "dashboard" as const, label: "Relatórios", icon: BarChart3 },
  { page: "dashboard" as const, label: "Configurações", icon: Settings }
];

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("escuro.token") ?? "");
  const [page, setPage] = useState<Page>(token ? "dashboard" : "dashboard");
  const [planos, setPlanos] = useState<Plano[]>(fallbackPlanos);
  const [contratos, setContratos] = useState<Contrato[]>(fallbackContratos);
  const [selected, setSelected] = useState<Contrato>(fallbackContratos[0]);
  const [notice, setNotice] = useState("");

  const logged = Boolean(token);

  async function loadData(currentToken = token) {
    if (!currentToken) return;
    try {
      const [planosApi, contratosApi] = await Promise.all([api.planos(currentToken), api.contratos(currentToken)]);
      setPlanos(planosApi.length ? planosApi : fallbackPlanos);
      setContratos(contratosApi.length ? contratosApi : fallbackContratos);
      if (contratosApi[0]) setSelected(contratosApi[0]);
    } catch {
      setNotice("API indisponível. Exibindo dados de demonstração.");
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleLogin(usuario: string, senha: string) {
    const result = await api.token({ usuario, senha, clientId: "escuro-web", clientSecret: "local-client-secret-example" });
    localStorage.setItem("escuro.token", result.accessToken);
    setToken(result.accessToken);
    setPage("dashboard");
    setNotice("Login realizado com sucesso.");
    await loadData(result.accessToken);
  }

  function handleLogout() {
    localStorage.removeItem("escuro.token");
    setToken("");
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

  if (!logged) {
    return <LoginScreen onLogin={handleLogin} notice={notice} />;
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} onLogout={handleLogout} />
      <main className="main-area">
        <Topbar />
        {notice && <div className="notice">{notice}</div>}
        {page === "dashboard" && <Dashboard contratos={contratos} planos={planos} setPage={setPage} setSelected={setSelected} />}
        {page === "clientes" && <Clientes contratos={contratos} />}
        {page === "contratos" && <Contratos contratos={contratos} setPage={setPage} setSelected={setSelected} />}
        {page === "novo" && <NovoContrato planos={planos} onCreate={handleCreate} />}
        {page === "detalhes" && <Detalhes contrato={selected} onCloseContract={handleCloseContract} />}
        {page === "planos" && <Planos planos={planos} />}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin, notice }: { onLogin: (usuario: string, senha: string) => Promise<void>; notice: string }) {
  const [usuario, setUsuario] = useState("atendente.escuro");
  const [senha, setSenha] = useState("demo-password");
  const [tokenGerado, setTokenGerado] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      await onLogin(usuario, senha);
      setTokenGerado("Bearer token salvo para as rotas protegidas.");
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
          <h1>Gerar Token</h1>
          <p>Gere um Bearer Token para utilizar na API.</p>
          <Field label="Usuário*" value={usuario} onChange={setUsuario} />
          <Field label="Senha*" value={senha} onChange={setSenha} type="password" />
          <button className="primary wide" onClick={submit} disabled={loading}>
            {loading ? "Gerando..." : "Gerar Token"}
          </button>
          {(tokenGerado || notice) && <div className="token-box">{tokenGerado || notice}</div>}
        </div>
      </section>
    </div>
  );
}

function Sidebar({ page, setPage, onLogout }: { page: Page; setPage: (page: Page) => void; onLogout: () => void }) {
  return (
    <aside className="sidebar">
      <BrandMark />
      <nav>
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} className={page === item.page && item.label !== "Relatórios" && item.label !== "Configurações" ? "active" : ""} onClick={() => setPage(item.page)}>
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

function Topbar() {
  return (
    <header className="topbar">
      <div />
      <div className="operator">
        <div className="bell">
          <Bell size={18} />
          <span>3</span>
        </div>
        <div>
          <strong>Atendente</strong>
          <small>Online</small>
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
    documento: "00000000191",
    nome: "Cliente Exemplo",
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
        <button className="primary">
          <Plus size={16} />
          Novo Plano
        </button>
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
              <th>Ações</th>
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
                <td><IconButton icon={Pencil} label="Editar plano" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
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
              <IconButton icon={Pencil} label="Editar contrato" />
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

function money(value: number | null) {
  return (value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function planoInternet(idPlano: string) {
  return fallbackPlanos.find((plano) => plano.id === idPlano)?.franquiaInternet ?? "-";
}
