export default function Locked() {
  return (
    <div className="flex min-h-[82vh] items-center justify-center px-6">
      <form
        action="/"
        method="get"
        className="w-full max-w-xs rounded-3xl border border-line bg-white/70 p-8 text-center shadow-[0_18px_50px_-28px_rgba(20,22,28,.4)] backdrop-blur-xl"
      >
        <div className="text-4xl">🐝</div>
        <h1 className="mt-3 text-2xl font-black">
          <span className="text-accent">//</span> 小蜜蜂
        </h1>
        <p className="mt-1 text-sm text-muted">請輸入密碼</p>
        <input
          name="k"
          type="password"
          autoFocus
          placeholder="密碼"
          className="mt-5 w-full rounded-xl border border-line bg-white px-4 py-3 text-center outline-none focus:border-accent"
        />
        <button className="mt-3 w-full rounded-xl bg-accent py-3 font-bold text-white transition hover:opacity-90">
          進入
        </button>
      </form>
    </div>
  );
}
