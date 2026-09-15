## 图论
### Dijkstra
```cpp
#include <bits/stdc++.h>
using namespace std;
const int N = 2e5 + 9;
const int INF = 1e9 + 10;
struct edge {
	int v, w, nxt;
} e[N];
int _, head[N];
void adde(int u, int v, int w) {
	e[++_].v = v;
	e[_].w = w;
	e[_].nxt = head[u];
	head[u] = _;
}
int n, m, s, dis[N];
struct node {
	int u, d;
	bool operator<(const node& other) const { return d > other.d; }
};
priority_queue<node> q;
bool vis[N];
void dijkstra() {
	for (int i = 1; i <= n; i++) dis[i] = INF;
	dis[s] = 0;
	q.push((node){s, 0});
	while (!q.empty()) {
		int u = q.top().u, d = q.top().d;
		q.pop();
		if (vis[u]) continue;
		vis[u] = 1;
		for (int i = head[u]; i; i = e[i].nxt) {
			int v = e[i].v, w = e[i].w;
			if (dis[v] > d + w) {
				dis[v] = d + w;
				q.push((node){v, d + w});
			}
		}
	}
}
int main() {
	cin >> n >> m >> s;
	for (int i = 1, u, v, w; i <= m; i++) {
		cin >> u >> v >> w;
		adde(u, v, w);
	}
	dijkstra();
	for (int i = 1; i <= n; i++) cout << dis[i] << " ";
	return 0;
}
```
### SPFA
```cpp
struct edge {
	int v, w, nxt;
} e[N];
int _, head[N];
void adde(int u, int v, int w) {
	e[++_].v = v;
	e[_].w = w;
	e[_].nxt = head[u];
	head[u] = _;
}
int n, m, dis[N], T, len[N];
queue<int> q;
bool vis[N];
int main() {
	cin >> T;
	while (T--) {
		cin >> n >> m;
		_ = 0;
		while (!q.empty()) q.pop();
		for (int i = 1; i <= n; i++) dis[i] = INF, head[i] = vis[i] = len[i] = 0;
		for (int i = 1, u, v, w; i <= m; i++) {
			cin >> u >> v >> w;
			adde(u, v, w);
			if (w >= 0) adde(v, u, w);
		}
		q.push(1);
		vis[1] = 1;
		dis[1] = 0;
		bool hv = 0;
		while (!q.empty()) {
			int u = q.front();
			q.pop();
			vis[u] = 0;
			for (int i = head[u]; i; i = e[i].nxt) {
				int v = e[i].v, w = e[i].w;
				if (dis[v] > dis[u] + w) {
					dis[v] = dis[u] + w;
					len[v] = len[u] + 1;
					if (len[v] >= n) {
						cout << "YES\n";
						hv = 1;
						break;
					}
					if (!vis[v]) q.push(v), vis[v] = 1;
				}
			}
			if (hv) break;
		}
		if (!hv) cout << "NO\n";
	}
	return 0;
}
```
### Floyd（矩阵快速幂加速）
```cpp
struct Matrix {
	ll val[120][120];
	Matrix() {
		for (int i = 1; i <= 100; i++)
			for (int j = 1; j <= 100; j++) val[i][j] = INF;
	}
	void IE() {
		for (int i = 1; i <= 100; i++) val[i][i] = 0;
	}
	Matrix operator+(const Matrix& other) const {
		Matrix ans;
		for (int i = 1; i <= 100; i++)
			for (int j = 1; j <= 100; j++) ans.val[i][j] = min(ans.val[i][j], other.val[i][j]);
		return ans;
	}
	Matrix operator*(const Matrix& other) const {
		Matrix ans;
		for (int k = 1; k <= 100; k++)
			for (int i = 1; i <= 100; i++)
				for (int j = 1; j <= 100; j++)
					ans.val[i][j] = min(ans.val[i][j], val[i][k] + other.val[k][j]);
		return ans;
	}
};
int main() {
	Matrix A, ans;
	ans.IE();
	int n, k;
	cin >> n >> k;
	for (int i = 1; i <= n; i++)
		for (int j = 1; j <= n; j++) cin >> A.val[i][j];
	for (; k; k >>= 1, A = A * A)
		if (k & 1) ans = ans * A;
	for (int i = 1; i <= n; i++) cout << ans.val[i][i] << '\n';
	return 0;
}
```
### 拓扑排序
```cpp
int _, head[N];
void addedge(int u, int v) {
	e[++_].v = v;
	e[_].nxt = head[u];
	head[u] = _;
}
int T, n, m, res, in[N], ans[N];
void toposort() {
	priority_queue<int, vector<int>, less<int> > q;
	res = n;
	for (int i = 1; i <= n; i++)
		if (in[i] == 0) q.push(i);
	while (!q.empty()) {
		int u = q.top();
		q.pop();
		ans[res--] = u;
		for (int i = head[u]; i; i = e[i].nxt) {
			int v = e[i].v;
			in[v]--;
			if (in[v] == 0) q.push(v);
		}
	}
}
int main() {
	cin >> T;
	while (T--) {
		cin >> n >> m;
		_ = 0;
		for (int i = 1; i <= n; i++) head[i] = in[i] = 0;
		for (int i = 1, u, v; i <= m; i++) {
			cin >> u >> v;
			addedge(v, u);
			in[u]++;
		}
		toposort();
		if (res != 0)
			cout << "Impossible!";
		else
			for (int i = 1; i <= n; i++) cout << ans[i] << " ";
		cout << '\n';
	}
	return 0;
}
```
### dfs序求LCA
```cpp
int dfn[N], dn, st[30][N];
void dfs(int u, int fa) {
	st[0][dfn[u] = ++dn] = fa;
	for (int i = head[u]; i; i = e[i].nxt) {
		int v = e[i].v;
		if (!dfn[v]) dfs(v, u);
	}
}
int get(int x, int y) { return dfn[x] < dfn[y] ? x : y; }
int n, m, lg[N], root;
int lca(int u, int v) {
	if (u == v) return u;
	u = dfn[u];
	v = dfn[v];
	if (u > v) swap(u, v);
	u++;
	int x = lg[v - u + 1];
	return get(st[x][u], st[x][v - (1 << x) + 1]);
}
int main() {
	cin >> n >> m >> root;
	for (int i = 2; i <= n; i++) lg[i] = lg[i / 2] + 1;
	for (int i = 1, u, v; i <= n - 1; i++) {
		cin >> u >> v;
		addedge(u, v);
		addedge(v, u);
	}
	dfs(root, 0);
	for (int k = 1; k <= lg[n]; k++)
		for (int i = 1; i <= n - (1 << k - 1); i++)
			st[k][i] = get(st[k - 1][i], st[k - 1][i + (1 << k - 1)]);
	for (int i = 1, u, v; i <= m; i++) {
		cin >> u >> v;
		cout << lca(u, v) << '\n';
	}
	return 0;
}
```
### Kruskal重构树
```cpp
struct edge {
	int v, nxt;
	ll w;
} e[M];
int head[N], _;
void addedge(int u, int v, ll w) {
	e[++_].v = v;
	e[_].w = w;
	e[_].nxt = head[u];
	head[u] = _;
}
struct node {
	int u;
	ll d;
	bool operator<(const node& x) const { return d > x.d; }
};
ll dis[N];
bool vis[N];
void dijkstra(int s) {
	for (int i = 0; i < N; i++) dis[i] = INF;
	dis[s] = 0;
	priority_queue<node> q;
	q.push((node){s, 0ll});
	while (!q.empty()) {
		int u = q.top().u;
		ll d = q.top().d;
		q.pop();
		if (vis[u]) continue;
		vis[u] = 1;
		for (int i = head[u]; i; i = e[i].nxt) {
			int v = e[i].v;
			ll w = e[i].w;
			if (dis[v] > d + w) {
				dis[v] = d + w;
				if (!vis[v]) q.push((node){v, dis[v]});
			}
		}
	}
}
struct Edge {
	int u, v, h;
} E[M];
bool cmp(Edge x, Edge y) { return x.h > y.h; }
int ff[N];
int find(int x) { return x == ff[x] ? x : ff[x] = find(ff[x]); }
ll minn[N];
int dp[N][25], val[N];
int n, m, cnt;
void kruskal() {
	cnt = n;
	for (int i = 1; i <= n; i++) ff[i] = i;
	for (int i = 1; i <= n; i++) minn[i] = dis[i];
	sort(E + 1, E + 1 + m, cmp);
	for (int i = 1; i <= m; i++) {
		int fu = find(E[i].u), fv = find(E[i].v);
		if (fu == fv) continue;
		val[++cnt] = E[i].h;
		ff[fu] = ff[fv] = ff[cnt] = cnt;
		minn[cnt] = min(minn[fu], minn[fv]);
		dp[fu][0] = dp[fv][0] = cnt;
	}
}
void init() {
	_ = 0;
	for (int i = 0; i < N; i++) head[i] = 0;
	for (int i = 0; i < N; i++) vis[i] = 0;
	for (int i = 0; i < N; i++) minn[i] = INF;
	for (int i = 0; i < N; i++)
		for (int j = 0; j < 23; j++) dp[i][j] = 0;
}
int main() {
	int T;
	cin >> T;
	while (T--) {
		init();
		cin >> n >> m;
		for (int i = 1; i <= m; i++) {
			int u, v, w;
			ll a;
			cin >> u >> v >> w >> a;
			addedge(u, v, w);
			addedge(v, u, w);
			E[i].u = u;
			E[i].v = v;
			E[i].h = a;
		}
		dijkstra(1);
		kruskal();
		for (int i = 1; (1 << i) <= cnt; i++)
			for (int u = 1; u <= cnt; u++) dp[u][i] = dp[dp[u][i - 1]][i - 1];
		ll q, k, h;
		cin >> q >> k >> h;
		ll lastans = 0;
		while (q--) {
			int s0, p0;
			cin >> s0 >> p0;
			int s = (s0 + k * lastans - 1) % n + 1, p = (p0 + k * lastans) % (h + 1);
			for (int j = 22; j >= 0; j--)
				if (dp[s][j] && val[dp[s][j]] > p) s = dp[s][j];
			cout << (lastans = minn[s]) << '\n';
		}
	}
	return 0;
}
```
### 虚树
```cpp
vector<pair<int, ll>> e1[N];
vector<int> e2[N];
int dfn[N], dn, st[30][N];
ll w[N];
void dfs1(int u, int fa) {
	st[0][dfn[u] = ++dn] = fa;
	for (auto x : e1[u]) {
		int v = x.first;
		ll val = x.second;
		if (v == fa) continue;
		w[v] = min(w[u], val);
		dfs1(v, u);
	}
}
int lg[N];
int get(int x, int y) { return dfn[x] < dfn[y] ? x : y; }
int lca(int u, int v) {
	if (u == v) return u;
	u = dfn[u];
	v = dfn[v];
	if (u > v) swap(u, v);
	u++;
	int k = lg[v - u + 1];
	return get(st[k][u], st[k][v - (1 << k) + 1]);
}
bool cmp(int x, int y) { return dfn[x] < dfn[y]; }
ll dp[N];
void dfs2(int u, int fa) {
	for (auto v : e2[u]) {
		if (v == fa) continue;
		dfs2(v, u);
		dp[u] += min(dp[v], w[v]);
	}
}
int main() {
	int n;
	cin >> n;
	for (int i = 2; i <= n; i++) lg[i] = lg[i / 2] + 1;
	for (int i = 1; i < n; i++) {
		int u, v;
		ll w;
		cin >> u >> v >> w;
		e1[u].push_back(make_pair(v, w));
		e1[v].push_back(make_pair(u, w));
	}
	w[1] = INF;
	dfs1(1, 0);
	for (int k = 1; k <= lg[n]; k++) {
		for (int i = 1; i <= n - (1 << k - 1); i++) {
			st[k][i] = get(st[k - 1][i], st[k - 1][i + (1 << k - 1)]);
		}
	}
	int m;
	cin >> m;
	while (m--) {
		int k;
		cin >> k;
		vector<int> vec1, vec2;
		for (int i = 1; i <= k; i++) {
			int x;
			cin >> x;
			vec1.push_back(x);
			vec2.push_back(x);
			dp[x] = INF;
		}
		sort(vec1.begin(), vec1.end(), cmp);
		vec2.push_back(1);
		for (int i = 1; i < vec1.size(); i++) {
			vec2.push_back(lca(vec1[i], vec1[i - 1]));
		}
		sort(vec2.begin(), vec2.end(), cmp);
		vec2.erase(unique(vec2.begin(), vec2.end()), vec2.end());
		for (int i = 1; i < vec2.size(); i++) {
			int u = lca(vec2[i], vec2[i - 1]), v = vec2[i];
			e2[u].push_back(v);
			e2[v].push_back(u);
		}
		dfs2(1, 0);
		cout << dp[1] << '\n';
		for (auto x : vec2) {
			e2[x].clear();
			dp[x] = 0;
		}
	}
	return 0;
}
```
### 边双连通分量
```cpp
vector<int> ans[N];
int dfn[N], dn, low[N], stc[N], top, cn;
void tj(int u, int eid) {
	dfn[u] = low[u] = ++dn;
	stc[++top] = u;
	for (int i = head[u]; i; i = e[i].nxt) {
		int v = e[i].v, id = e[i].id;
		if (id == eid) continue;
		if (!dfn[v]) {
			tj(v, id);
			low[u] = min(low[u], low[v]);
		} else
			low[u] = min(low[u], dfn[v]);
	}
	if (low[u] >= dfn[u]) {
		cn++;
		do ans[cn].push_back(stc[top]);
		while (stc[top--] != u);
	}
}
void tarjan() {
	for (int i = 1; i <= n; i++)
		if (!dfn[i]) tj(i, 0);
	cout << cn << '\n';
	for (int i = 1; i <= cn; i++) {
		cout << ans[i].size() << " ";
		for (int j = 0; j < ans[i].size(); j++) cout << ans[i][j] << " ";
		cout << '\n';
	}
}
int main() {
	cin >> n >> m;
	for (int i = 1, u, v; i <= m; i++) {
		cin >> u >> v;
		adde(u, v, i);
		adde(v, u, i);
	}
	tarjan();
	return 0;
}
```
### 点双连通分量
```cpp
void minn(int& x, int y) {
	if (y < x) x = y;
}
int root, dn, dfn[N], low[N], stc[N], top, cn;
vector<int> ans[N];
void tj(int u) {
	dfn[u] = low[u] = ++dn;
	stc[++top] = u;
	if (u == root && head[u] == 0) {
		ans[++cn].push_back(u);
		return;
	}
	for (int i = head[u]; i; i = e[i].nxt) {
		int v = e[i].v;
		if (!dfn[v]) {
			tj(v);
			minn(low[u], low[v]);
			if (low[v] >= dfn[u]) {
				cn++;
				do ans[cn].push_back(stc[top]);
				while (stc[top--] != v);
				ans[cn].push_back(u);
			}
		} else
			minn(low[u], dfn[v]);
	}
}
int n, m;
void tarjan() {
	for (int i = 1; i <= n; i++)
		if (!dfn[i]) root = i, tj(i);
	cout << cn << '\n';
	for (int i = 1; i <= cn; i++) {
		cout << ans[i].size() << " ";
		for (int j = 0; j < ans[i].size(); j++) cout << ans[i][j] << " ";
		cout << '\n';
	}
}
int main() {
	cin >> n >> m;
	for (int i = 1, u, v; i <= m; i++) {
		cin >> u >> v;
		if (u == v) continue;
		addedge(u, v);
		addedge(v, u);
	}
	tarjan();
	return 0;
}
```
### 割点
```cpp
int root, dn, dfn[N], low[N], cnt;
bool cp[N];
void dfs(int u) {
	dfn[u] = low[u] = ++dn;
	int flag = 0;
	for (int i = head[u]; i; i = e[i].nxt) {
		int v = e[i].v;
		if (!dfn[v]) {
			dfs(v);
			low[u] = min(low[u], low[v]);
			if (low[v] >= dfn[u])
				if (u != root || ++flag >= 2) cnt += !cp[u], cp[u] = 1;
		} else
			low[u] = min(low[u], dfn[v]);
	}
}
int n, m;
int main() {
	cin >> n >> m;
	for (int i = 1, u, v; i <= m; i++) {
		cin >> u >> v;
		addedge(u, v);
		addedge(v, u);
	}
	for (int i = 1; i <= n; i++)
		if (!dfn[i]) root = i, dfs(i);
	cout << cnt << '\n';
	for (int i = 1; i <= n; i++)
		if (cp[i]) cout << i << " ";
	return 0;
}
```
### 缩点
```cpp
int top, stc[N], dn, dfn[N], low[N], cn, col[N];
bool vis[N];
void dfs(int u) {
	vis[u] = 1;
	dfn[u] = low[u] = ++dn;
	stc[++top] = u;
	for (int i = head[u]; i; i = e[i].nxt) {
		int v = e[i].v;
		if (!dfn[v]) {
			dfs(v);
			low[u] = min(low[u], low[v]);
		} else if (vis[v])
			low[u] = min(low[u], dfn[v]);
	}
	if (dfn[u] == low[u]) {
		++cn;
		do {
			col[stc[top]] = cn;
			vis[stc[top]] = 0;
		} while (stc[top--] != u);
	}
}
vector<int> g[N];
int a[N], val[N], f[N], ans, n, m;
void tarjan() {
	for (int i = 1; i <= n; i++)
		if (!dfn[i]) dfs(i);
	for (int u = 1; u <= n; u++) {
		val[col[u]] += a[u];
		for (int i = head[u]; i; i = e[i].nxt) {
			int v = e[i].v;
			if (col[u] == col[v]) continue;
			g[col[u]].push_back(col[v]);
		}
	}
}
int main() {
	cin >> n >> m;
	for (int i = 1; i <= n; i++) cin >> a[i];
	for (int i = 1, u, v; i <= m; i++) {
		cin >> u >> v;
		addedge(u, v);
	}
	tarjan();
	for (int u = cn; u >= 1; u--) {
		f[u] += val[u];
		ans = max(ans, f[u]);
		for (int j = 0; j < g[u].size(); j++) {
			int v = g[u][j];
			f[v] = max(f[v], f[u]);
		}
	}
	cout << ans;
	return 0;
}
```
### 圆方树
```cpp
void minn(int& x, int y) {
	if (y < x) x = y;
}
struct edge {
	int v, nxt;
} e[N * 2];
int _, head[N];
void adde(int u, int v) {
	e[++_].v = v;
	e[_].nxt = head[u];
	head[u] = _;
}
vector<int> g[N];
void addg(int u, int v) {
	g[u].push_back(v);
	g[v].push_back(u);
}
int dn, dfn[N], low[N], stc[N], top, cn;
void tj(int u) {
	dfn[u] = low[u] = ++dn;
	stc[++top] = u;
	for (int i = head[u]; i; i = e[i].nxt) {
		int v = e[i].v;
		if (!dfn[v]) {
			tj(v);
			minn(low[u], low[v]);
			if (low[v] >= dfn[u]) {
				cn++;
				addg(cn, u);
				do addg(cn, stc[top]);
				while (stc[top--] != v);
			}
		} else
			minn(low[u], dfn[v]);
	}
}
int st[22][N], lg[N], s[N];
int T, n, m, q, o, ans, p[N];
void dfs(int u, int fa) {
	dfn[u] = ++dn;
	st[0][dn] = fa;
	if (u <= n) s[u]++;
	s[u] += s[fa];
	for (int i = 0; i < g[u].size(); i++) {
		int v = g[u][i];
		if (v == fa) continue;
		dfs(v, u);
	}
}
int get(int u, int v) { return dfn[u] < dfn[v] ? u : v; }
int lca(int u, int v) {
	if (u == v) return u;
	u = dfn[u];
	v = dfn[v];
	if (u > v) swap(u, v);
	u++;
	int x = lg[v - u + 1];
	return get(st[x][u], st[x][v - (1 << x) + 1]);
}
bool cmp(int x, int y) { return dfn[x] < dfn[y]; }
int main() {
	for (int i = 2; i < N; i++) lg[i] = lg[i / 2] + 1;
	cin >> T;
	while (T--) {
		cin >> n >> m;
		_ = dn = 0;
		cn = n;
		for (int i = 0; i < N; i++) s[i] = dfn[i] = head[i] = 0, g[i].clear();
		for (int i = 1, u, v; i <= m; i++) {
			cin >> u >> v;
			adde(u, v);
			adde(v, u);
		}
		tj(1);
		dn = 0;
		dfs(1, 0);
		for (int k = 1; k <= lg[cn]; k++)
			for (int i = 1; i <= cn - (1 << k - 1); i++)
				st[k][i] = get(st[k - 1][i], st[k - 1][i + (1 << k - 1)]);
		cin >> q;
		while (q--) {
			cin >> o;
			ans = 0;
			for (int i = 1; i <= o; i++) cin >> p[i], ans += s[p[i]];
			sort(p + 1, p + 1 + o, cmp);
			p[0] = p[o];
			for (int i = 1; i <= o; i++) ans -= s[lca(p[i], p[i - 1])];
			if (lca(p[1], p[0]) <= n) ans++;
			cout << ans - o << '\n';
		}
	}
	return 0;
}
```
### Two-SAT
```cpp
int n, m, dn, dfn[N], low[N], cn, col[N], stc[N], tp;
bool vis[N];
void dfs(int u) {
	dfn[u] = low[u] = ++dn;
	stc[++tp] = u;
	vis[u] = 1;
	for (int i = head[u]; i; i = e[i].nxt) {
		int v = e[i].v;
		if (!dfn[v]) dfs(v);
		if (vis[v]) low[u] = min(low[u], low[v]);
	}
	if (dfn[u] == low[u]) {
		cn++;
		do {
			col[stc[tp]] = cn;
			vis[stc[tp]] = 0;
		} while (stc[tp--] != u);
	}
}
void tarjan() {
	for (int i = 2; i <= 2 * n + 1; i++)
		if (!dfn[i]) dfs(i);
}
bool ans[N];
int main() {
	cin >> n >> m;
	for (int i = 1, u, v, a, b; i <= m; i++) {
		cin >> u >> a >> v >> b;
		adde((u << 1 | a) ^ 1, v << 1 | b);
		adde((v << 1 | b) ^ 1, u << 1 | a);
	}
	tarjan();
	for (int i = 1; i <= n; i++) {
		if (col[i << 1] == col[i << 1 | 1]) {
			cout << "IMPOSSIBLE";
			return 0;
		}
		if (col[i << 1 | 1] < col[i << 1]) ans[i] = 1;
	}
	cout << "POSSIBLE\n";
	for (int i = 1; i <= n; i++) cout << ans[i] << " ";
	return 0;
}
```
### 二分图染色
```cpp
int col[N];
bool dfs(int u, int c) {
	col[u] = c;
	for (int i = head[u]; i; i = e[i].nxt) {
		int v = e[i].v;
		if (!col[v]) {
			if (!dfs(v, -c)) return 0;
		} else if (col[u] == col[v])
			return 0;
	}
	return 1;
}
int n, m, T;
int main() {
	for (int i = 1, u, v; i <= m; i++) {
		cin >> u >> v;
		addedge(u, v);
		addedge(v, u);
	}
	bool k = 1;
	for (int i = 1; i <= n; i++)
		if (!col[i]) k &= dfs(i, 1);
	cout << k << '\n';
	return 0;
}
```
### 二分图匹配
```cpp
int n1, n2, m, match[N], ans;
bool used[N];
bool dfs(int u) {
	for (int i = head[u]; i; i = e[i].nxt) {
		int v = e[i].v;
		if (!used[v]) {
			used[v] = 1;
			if (!match[v] || dfs(match[v])) {
				match[v] = u;
				return 1;
			}
		}
	}
	return 0;
}
int main() {
	cin >> n1 >> n2 >> m;
	for (int i = 1, u, v; i <= m; i++) {
		cin >> u >> v;
		addedge(u, v + n1);
	}
	for (int i = 1; i <= n1; i++) {
		for (int j = n1 + 1; j <= n1 + n2; j++) used[j] = 0;
		if (dfs(i)) ans++;
	}
	cout << ans;
	return 0;
}
```
### 二分图性质
最小点覆盖数=最大匹配数
最小边覆盖数=总顶点数-最大匹配数
二分图的最大点独立集数=总顶点数-最小点覆盖数
且二分图的最大点独立集与最小点覆盖集互补
DAG的最小不相交路径覆盖
将所有点拆成两个 将原图边  转化为 
DAG图的最小不相交路径覆盖数=原图顶点数-新建二分图最大匹配数
DAG的最小可相交路径覆盖
floyd传递闭包 若  能到达  则加边 
可以转化为最小不相交路径问题
编号小点较前拓扑序
转化为反序列的字典序最大的排列
建反图 求字典序最大排列
### Dinic
```cpp
const int INF = 1e9;
struct edge {
	int v, c, nxt;
} e[N];
int _ = 1, head[N];
void adde(int u, int v, int c) {
	e[++_].v = v;
	e[_].c = c;
	e[_].nxt = head[u];
	head[u] = _;
	e[++_].v = u;
	e[_].c = 0;
	e[_].nxt = head[v];
	head[v] = _;
}
int dis[N], s, t, cur[N];
bool bfs() {
	for (int i = 1; i <= t; i++) {
		dis[i] = INF;
		cur[i] = head[i];
	}
	queue<int> q;
	q.push(s);
	dis[s] = 0;
	while (!q.empty()) {
		int u = q.front();
		q.pop();
		for (int i = head[u]; i; i = e[i].nxt) {
			int v = e[i].v, c = e[i].c;
			if (c > 0 && dis[v] > dis[u] + 1) {
				dis[v] = dis[u] + 1;
				q.push(v);
			}
		}
	}
	return dis[t] != INF;
}
int dfs(int u, int flow) {
	if (u == t) return flow;
	int res = 0;
	for (int i = cur[u]; i && flow; i = e[i].nxt) {
		cur[u] = i;
		int v = e[i].v, c = e[i].c;
		if (c > 0 && dis[v] == dis[u] + 1) {
			int fw = dfs(v, min(c, flow));
			flow -= fw;
			res += fw;
			e[i].c -= fw;
			e[i ^ 1].c += fw;
		}
	}
	return res;
}
int sum;
void dinic() {
	int res = 0, tmp;
	while (bfs() && (tmp = dfs(s, INF))) res += tmp;
	cout << sum - res;
}
int n, m;
int main() {
	cin >> n >> m;
	s = n + m + 1;
	t = s + 1;
	for (int i = 1, p; i <= n; i++) {
		cin >> p;
		adde(s, i, p);
	}
	for (int i = 1, a, b, c; i <= m; i++) {
		cin >> a >> b >> c;
		sum += c;
		adde(a, n + i, INF);
		adde(b, n + i, INF);
		adde(n + i, t, c);
	}
	dinic();
	return 0;
}
```
### ISAP
```cpp
struct edge {
	int v, nxt;
	ll c;
} e[N];
int _ = 1, head[N];
void adde(int u, int v, ll c) {
	e[++_].v = v;
	e[_].c = c;
	e[_].nxt = head[u];
	head[u] = _;
}
int n, m, s, t, dep[N], gap[N];
void bfs() {
	for (int i = 1; i <= n; i++) dep[i] = n + 1;
	for (int i = 1; i <= n; i++) gap[i] = 0;
	queue<int> q;
	q.push(t);
	dep[t] = 0;
	gap[0]++;
	while (!q.empty()) {
		int u = q.front();
		q.pop();
		for (int i = head[u]; i; i = e[i].nxt) {
			int v = e[i].v;
			if (e[i ^ 1].c > 0 && dep[v] == n + 1) {
				dep[v] = dep[u] + 1;
				gap[dep[v]]++;
				q.push(v);
			}
		}
	}
}
int cur[N];
void init() {
	for (int i = 1; i <= n; i++) cur[i] = head[i];
}
ll dfs(int u, ll flow) {
	if (u == t) return flow;
	ll res = 0;
	for (int i = cur[u]; i && flow; i = e[i].nxt) {
		cur[u] = i;
		int v = e[i].v;
		ll c = e[i].c;
		if (c > 0 && dep[v] == dep[u] - 1) {
			ll fw = dfs(v, min(c, flow));
			res += fw;
			flow -= fw;
			e[i].c -= fw;
			e[i ^ 1].c += fw;
		}
	}
	if (flow) {
		gap[dep[u]]--;
		if (!gap[dep[u]]) dep[s] = n + 1;
		dep[u]++;
		gap[dep[u]]++;
	}
	return res;
}
ll ans;
ll mp[2000][2000];
void isap() {
	for (int b = 28; b >= 0; b -= 4) {
		for (int i = 1; i <= n; i++)
			for (int j = i + 1; j <= n; j++) {
				if ((mp[i][j] > 0 || mp[j][i] > 0) &&
					(mp[i][j] >= (1 << b) || mp[j][i] >= (1 << b))) {
					adde(i, j, mp[i][j]);
					adde(j, i, mp[j][i]);
					mp[i][j] = mp[j][i] = 0;
				}
			}
		bfs();
		while (init(), dep[s] < n) ans += dfs(s, INF);
	}
}
int main() {
	cin >> n >> m >> s >> t;
	for (int i = 1, u, v; i <= m; i++) {
		ll c;
		cin >> u >> v >> c;
		mp[u][v] += c;
	}
	isap();
	cout << ans;
	return 0;
}
```
### 最小费用最大流
```cpp
const int INF = 1e9;
struct edge {
	int v, c, w, nxt;
} e[N];
int _ = 1, head[N];
void adde(int u, int v, int c, int w) {
	e[++_].v = v;
	e[_].c = c;
	e[_].w = w;
	e[_].nxt = head[u];
	head[u] = _;
	e[++_].v = u;
	e[_].c = 0;
	e[_].w = -w;
	e[_].nxt = head[v];
	head[v] = _;
}
int s, t, dis[N], cur[N];
bool vis[N];
bool spfa() {
	for (int i = 1; i <= t; i++) {
		dis[i] = INF;
		cur[i] = head[i];
		vis[i] = 0;
	}
	queue<int> q;
	q.push(s);
	dis[s] = 0;
	vis[s] = 1;
	while (!q.empty()) {
		int u = q.front();
		q.pop();
		vis[u] = 0;
		for (int i = head[u]; i; i = e[i].nxt) {
			int v = e[i].v, c = e[i].c, w = e[i].w;
			if (c > 0 && dis[v] > dis[u] + w) {
				dis[v] = dis[u] + w;
				if (!vis[v]) {
					q.push(v);
					vis[v] = 1;
				}
			}
		}
	}
	return dis[t] != INF;
}
int dfs(int u, int flow) {
	if (u == t) return flow;
	int res = 0;
	vis[u] = 1;
	for (int i = cur[u]; i && flow; i = e[i].nxt) {
		cur[u] = i;
		int v = e[i].v, c = e[i].c, w = e[i].w;
		if (c > 0 && vis[v] == 0 && dis[v] == dis[u] + w) {
			int fw = dfs(v, min(c, flow));
			flow -= fw;
			res += fw;
			e[i].c -= fw;
			e[i ^ 1].c += fw;
		}
	}
	return res;
}
void dinic() {
	int res = 0, tmp;
	while (spfa() && (tmp = dfs(s, INF))) res += dis[t] * tmp;
	cout << -res;
}
int n, k;
set<int> st;
map<int, int> mp;
int main() {
	cin >> n >> k;
	vector<int> l(n + 1), r(n + 1);
	for (int i = 1; i <= n; i++) {
		cin >> l[i] >> r[i];
		st.insert(l[i]);
		st.insert(r[i]);
	}
	int cnt = 0;
	for (auto x : st) mp[x] = ++cnt;
	for (int i = 1; i <= n; i++) adde(mp[l[i]], mp[r[i]], 1, -(r[i] - l[i]));
	for (int i = 1; i <= cnt - 1; i++) adde(i, i + 1, k, 0);
	s = cnt + 1;
	t = s + 1;
	adde(s, 1, k, 0);
	adde(cnt, t, k, 0);
	dinic();
	return 0;
}
```
## 计算几何
### 二维凸包+旋转卡壳
```cpp
struct Point {
	ll x, y;
	Point() {}
	Point(ll x, ll y) : x(x), y(y) {}
	Point operator+(const Point& _) { return Point(x + _.x, y + _.y); }
	Point operator-(const Point& _) { return Point(x - _.x, y - _.y); }
	bool operator<(const Point& _) { return x < _.x || (x == _.x && y < _.y); }
	ll operator*(const Point& _) { return x * _.x + y * _.y; }
	ll operator^(const Point& _) { return x * _.y - y * _.x; }
};
typedef Point Vector;
ll len2(Vector v) { return v * v; }
double dist(Point A, Point B, Point C) { return abs(((A - B) ^ (A - C)) / sqrt(len2(B - C))); }
int Convex_hull(Point* p, int n, Point* ch) {
	sort(p, p + n);
	int cnt = 0;
	for (int i = 0; i < n; i++) {
		while (cnt > 1 && ((ch[cnt - 1] - ch[cnt - 2]) ^ (p[i] - ch[cnt - 1])) <= 0) cnt--;
		ch[cnt++] = p[i];
	}
	int tmp = cnt;
	for (int i = n - 2; i >= 0; i--) {
		while (cnt > tmp && ((ch[cnt - 1] - ch[cnt - 2]) ^ (p[i] - ch[cnt - 1])) <= 0) cnt--;
		ch[cnt++] = p[i];
	}
	if (cnt > 1) cnt--;
	return cnt;
}
Point p[N], ch[N];
int main() {
	int n;
	cin >> n;
	for (int i = 0; i < n; i++) cin >> p[i].x >> p[i].y;
	n = Convex_hull(p, n, ch);
	int tp = 1;
	ll ans = 0;
	for (int i = 0; i < n; i++) {
		while (dist(ch[tp % n], ch[i], ch[(i + 1) % n]) <
			   dist(ch[(tp + 1) % n], ch[i], ch[(i + 1) % n]))
			tp++;
		ans = max(ans, max(len2(ch[tp % n] - ch[i]), len2(ch[tp % n] - ch[(i + 1) % n])));
	}
	cout << ans;
	return 0;
}
```
### 闵可夫斯基和（凸包与凸包）
```cpp
struct Point {
	ll x, y;
	Point() {}
	Point(ll x, ll y) : x(x), y(y) {}
	Point operator+(const Point& other) const { return Point(x + other.x, y + other.y); }
	Point& operator+=(const Point& other) { return *this = *this + other; }
	Point operator-(const Point& other) const { return Point(x - other.x, y - other.y); }
	bool operator<(const Point& other) const { return x < other.x || (x == other.x && y < other.y); }
	ll operator*(const Point& other) const { return x * other.x + y * other.y; }
	ll operator^(const Point& other) const { return x * other.y - y * other.x; }
	friend bool is_parallel(const Point& a, const Point& b) { return a.x * b.y == a.y * b.x; }
};
typedef Point Vector;

vector<Point> Convex_hull(vector<Point> p) {
	sort(p.begin(), p.end());
	vector<Point> ch;
	for (int i = 0; i < p.size(); i++) {
		while (ch.size() > 1 && ((ch[ch.size() - 1] - ch[ch.size() - 2]) ^ (p[i] - ch[ch.size() - 1])) <= 0)
			ch.pop_back();
		ch.push_back(p[i]);
	}
	int tmp = ch.size();
	for (int i = p.size() - 2; i >= 0; i--) {
		while (ch.size() > tmp && ((ch[ch.size() - 1] - ch[ch.size() - 2]) ^ (p[i] - ch[ch.size() - 1])) <= 0)
			ch.pop_back();
		ch.push_back(p[i]);
	}
	if (ch.size() > 1) ch.pop_back();
	return ch;
}

vector<Point> Mincowsky(vector<Point> p1, vector<Point> p2) {
	vector<Vector> v, sum;
	int n1 = p1.size(), n2 = p2.size();
	for (int i = 0, j = 0;; i++) {
		while (j < n2 && ((p2[(j + 1) % n2] - p2[j]) ^ (p1[(i + 1) % n1] - p1[i])) >= 0) {
			v.push_back(p2[(j + 1) % n2] - p2[j]);
			j++;
		}
		v.push_back(p1[(i + 1) % n1] - p1[i]);
		if (i == n1) {
			while (j < n2) {
				v.push_back(p2[(j + 1) % n2] - p2[j]);
				j++;
			}
			break;
		}
	}
	sum.push_back(p1[0] + p2[0]);
	sum.push_back(sum[0] + v[0]);
	for (int i = 1; i < n1 + n2; i++) {
		if (is_parallel(v[i], v[i - 1])) {
			sum[sum.size() - 1] += v[i];
		} else {
			sum.push_back(sum[sum.size() - 1] + v[i]);
		}
	}
	if (sum.size() > 1) sum.pop_back();
	return sum;
}

bool in_Convex_hull(Vector p, const vector<Point>& ch) {
	p = p - ch[0];
	if (((ch[1] - ch[0]) ^ p) < 0 || ((ch[ch.size() - 1] - ch[0]) ^ p) > 0) return 0;
	int l = 1, r = ch.size() - 2;
	while (l < r) {
		int mid = (l + r >> 1) + 1;
		if (((ch[mid] - ch[0]) ^ p) >= 0)
			l = mid;
		else
			r = mid - 1;
	}
	if (((ch[l + 1] - ch[l]) ^ (p + ch[0] - ch[l])) >= 0) return 1;
	return 0;
}

int main() {
	vector<Point> p1, p2, ch;
	int n, m, q;
	cin >> n >> m >> q;
	for (int i = 0, x, y; i < n; i++) {
		cin >> x >> y;
		p1.push_back(Point(x, y));
	}
	for (int i = 0, x, y; i < m; i++) {
		cin >> x >> y;
		p2.push_back(Point(-x, -y));
	}
	ch = Mincowsky(Convex_hull(p1), Convex_hull(p2));
	while (q--) {
		Point p;
		cin >> p.x >> p.y;
		cout << in_Convex_hull(p, ch) << '\n';
	}
	return 0;
}
```
### 半平面交
```cpp
#include <bits/stdc++.h>
using namespace std;
const double eps = 1e-6;
const int N = 2e5 + 100;
int sgn(double x) { return abs(x) <= eps ? 0 : (x < 0 ? -1 : 1); }
struct Point {
	double x, y;
	Point() {}
	Point(double x, double y) : x(x), y(y) {}
	bool operator==(const Point& other) const {
		return sgn(x - other.x) == 0 && sgn(y - other.y) == 0;
	}
	bool operator<(const Point& other) const {
		return sgn(x - other.x) < 0 || (sgn(x - other.x) == 0 && sgn(y - other.y) < 0);
	}
	Point operator-() const { return Point(-x, -y); }
	Point operator+(const Point& other) const { return Point(x + other.x, y + other.y); }
	Point operator-(const Point& other) const { return Point(x - other.x, y - other.y); }
	Point operator*(const double& k) const { return Point(x * k, y * k); }
	Point operator/(const double& k) const { return Point(x / k, y / k); }
	double operator^(const Point& other) const { return x * other.y - y * other.x; }
	double operator*(const Point& other) const { return x * other.x + y * other.y; }
	double len() const { return hypot(x, y); }
	Point ide() const { return Point(x, y) / len(); }
	Point ver() const { return Point(-y, x) / len(); }
};
double distance(const Point& p1, const Point& p2) { return hypot(p1.x - p2.x, p1.y - p2.y); }
struct Line {
	Point start, end;
	double angle;
	Line() {}
	Line(Point s, Point t) : start(s), end(t), angle(atan2(t.y - s.y, t.x - s.x)) {}
	bool operator<(const Line& other) const {
		if (sgn(angle - other.angle) == 0) return ((end - start) ^ (other.end - start)) < 0;
		return angle < other.angle;
	}
	double operator^(const Line& other) const { return (end - start) ^ (other.end - other.start); }
};
Point getPoint(Line l1, Line l2) {
	double s1 = (l2.end - l1.start) ^ (l1.end - l1.start),
		   s2 = (l2.start - l1.start) ^ (l1.end - l1.start);
	return (l2.start * s1 - l2.end * s2) / (s1 - s2);
}
bool isRight(Line l, Point p) { return sgn((l.start - p) ^ (l.end - p)) < 0; }
Line getLine(Line l1, Line l2) {
	Point p1, p2;
	double len1 = (l1.end - l1.start).len(), len2 = (l2.end - l2.start).len();
	if (sgn(l1.angle - l2.angle) == 0 || sgn(l1.angle - Line(l2.end, l2.start).angle) == 0) {
		Point ver = (l1.end - l1.start).ver(), ide = (l1.end - l1.start).ide();
		Line l(l1.start, l1.start + ver);
		Point p = getPoint(l, l2);
		p1 = l1.start + (p - l1.start) * len2 / (len1 + len2);
		p2 = p1 - ide;
		return Line(p1, p2);
	} else {
		p1 = getPoint(l1, l2);
		double angle = (l1.angle + Line(l2.end, l2.start).angle) / 2;
		Point vec = Point(cos(angle), sin(angle)).ver();
		Point pn = (l1.start == p1) ? l1.end : l1.start;
		Line l(pn, pn + vec);
		Point p = getPoint(l, l2);
		p2 = pn + ((p - pn) * len2 / (len1 + len2));
		if ((l1 ^ l2) < 0) swap(p1, p2);
	}
	return Line(p1, p2);
}
Line deq[N];
int Intersection_of_Half_Planes(int n, Line* l, Point* isc) {
	sort(l, l + n);
	int tot = 1;
	for (int i = 1; i < n; i++) {
		if (sgn(l[i].angle - l[i - 1].angle) != 0) {
			l[tot++] = l[i];
		}
	}
	int top = 1, back = 0;
	deq[0] = l[0];
	deq[1] = l[1];
	for (int i = 2; i < tot; i++) {
		while (back < top && isRight(l[i], getPoint(deq[top], deq[top - 1]))) top--;
		while (back < top && isRight(l[i], getPoint(deq[back], deq[back + 1]))) back++;
		deq[++top] = l[i];
	}
	while (back < top && isRight(deq[back], getPoint(deq[top], deq[top - 1]))) top--;
	while (back < top && isRight(deq[top], getPoint(deq[back], deq[back + 1]))) back++;
	for (int i = back; i < top; i++) {
		isc[i - back] = getPoint(deq[i], deq[i + 1]);
	}
	if (top - back > 1) isc[top - back] = getPoint(deq[top], deq[back]);
	return top - back + 1;
}
int n, cnt;
Line l[N];
Point isc[N];
int main() {
	cin >> n;
	vector<Point> vec;
	for (int i = 1; i <= n; i++) {
		double x, y;
		cin >> x >> y;
		double xx = x, yy = y;
		vec.push_back(Point(xx, yy));
	}
	double sum = 0;
	for (int i = 0; i < n; i++) {
		l[cnt++] = Line(vec[i], vec[(i + 1) % n]);
		sum += vec[i] ^ vec[(i + 1) % n];
	}
	for (int i = 1; i < n; i++) {
		l[cnt++] = getLine(l[0], l[i]);
	}
	cnt = Intersection_of_Half_Planes(cnt, l, isc);
	double ans = 0;
	for (int i = 0; i < cnt; i++) ans += isc[i] ^ isc[(i + 1) % cnt];
	cout << fixed << setprecision(4) << fabs(ans) / fabs(sum);
	return 0;
}
```
### 自适应辛普森法
```cpp
#include <bits/stdc++.h>
using namespace std;
const double eps = 1e-8;
double sqt(double x, double y) { return sqrt(x * x - y * y); }
struct node {
	int op;
	double x1, x2, o, r, k, b;
	node(int op, double x1, double x2, double a1, double a2) : op(op), x1(x1), x2(x2) {
		if (op == 1) {
			o = a1;
			r = a2;
		} else {
			k = a1;
			b = a2;
		}
	}
};
vector<node> vec;
double f(double x) {
	double ans = 0;
	for (auto v : vec) {
		if (x >= v.x1 && x <= v.x2) ans = max(ans, v.op == 1 ? sqt(v.r, x - v.o) : v.k * x + v.b);
	}
	return ans;
}
double simpson(double l, double r) { return (r - l) * (f(l) + f(r) + 4 * f((l + r) / 2)) / 6; }
double asr(double l, double r, double ans) {
	double mid = (l + r) / 2, ansl = simpson(l, mid), ansr = simpson(mid, r);
	return fabs(ansl + ansr - ans) <= 15 * eps ? ansl + ansr + (ansl + ansr - ans) / 15
											   : asr(l, mid, ansl) + asr(mid, r, ansr);
}
int n;
double alpha, h[10000], r[10000], o[10000];
void __() {
	cin >> n >> alpha;
	for (int i = 0; i <= n; i++) cin >> h[i];
	for (int i = 1; i <= n; i++) cin >> r[i];
	r[n + 1] = 0;
	for (int i = 1; i <= n + 1; i++) {
		o[i] = o[i - 1] + h[i - 1] / tan(alpha);
	}
	for (int i = 1; i <= n + 1; i++) {
		vec.push_back(node(1, o[i] - r[i], o[i] + r[i], o[i], r[i]));
	}
	double L = o[1] - r[1], R = o[1] + r[1];
	for (int i = 1; i <= n; i++) {
		L = min(L, o[i + 1] - r[i + 1]);
		R = max(R, o[i + 1] + r[i + 1]);
		if (abs(r[i + 1] - r[i]) >= o[i + 1] - o[i]) continue;
		double sinn = (r[i + 1] - r[i]) / (o[i + 1] - o[i]), x1 = o[i] - sinn * r[i],
			   x2 = o[i + 1] - sinn * r[i + 1];
		double y1 = sqt(r[i], x1 - o[i]), y2 = sqt(r[i + 1], x2 - o[i + 1]),
			   k = (y2 - y1) / (x2 - x1), b = y1 - k * x1;
		if (x2 >= x1) vec.push_back(node(2, x1, x2, k, b));
	}
	cout << fixed << setprecision(2) << 2 * asr(L, R, simpson(L, R));
}
int main() {
	__();
	return 0;
}
```
### 三维凸包（增量法）
```cpp
struct Point {
	ll x, y, z;
	Point() {}
	Point(ll x, ll y, ll z) : x(x), y(y), z(z) {}
	Point operator-(const Point& other) const {
		return Point(x - other.x, y - other.y, z - other.z);
	}
	Point operator+(const Point& other) const {
		return Point(x + other.x, y + other.y, z + other.z);
	}
	ll operator*(const Point& other) const { return x * other.x + y * other.y + z * other.z; }
	Point operator^(const Point& other) const {
		return Point(y * other.z - z * other.y, z * other.x - x * other.z,
					 x * other.y - y * other.x);
	}
};
Point p[N * 2];
struct Plane {
	int id[3];
	Plane() {}
	Plane(int id1, int id2, int id3) { id[0] = id1, id[1] = id2, id[2] = id3; }
	Point normal() const { return (p[id[1]] - p[id[0]]) ^ (p[id[2]] - p[id[0]]); }
};
bool is_above(Point pt, Plane f) { return (pt - p[f.id[0]]) * f.normal() > 0; }
int vis[N][N], vistim;
Plane res[N * 2], del[N * 2];
int convex_hull(int n, Plane fact[]) {
	int cnt = 0;
	fact[cnt++] = Plane(0, 1, 2);
	fact[cnt++] = Plane(0, 2, 1);
	for (int i = 3; i < n; i++) {
		vistim++;
		int cnt1 = 0, cnt2 = 0;
		for (int j = 0; j < cnt; j++) {
			if (is_above(p[i], fact[j])) {
				del[cnt2++] = fact[j];
				for (int k = 0; k < 3; k++) vis[fact[j].id[k]][fact[j].id[(k + 1) % 3]] = vistim;
			} else {
				res[cnt1++] = fact[j];
			}
		}
		for (int j = 0; j < cnt2; j++) {
			Plane f = del[j];
			for (int k = 0; k < 3; k++) {
				if (vis[f.id[k]][f.id[(k + 1) % 3]] == vistim &&
					vis[f.id[(k + 1) % 3]][f.id[k]] != vistim)
					res[cnt1++] = Plane(f.id[k], f.id[(k + 1) % 3], i);
			}
		}
		cnt = cnt1;
		for (int j = 0; j < cnt; j++) fact[j] = res[j];
	}
	return cnt;
}
Plane fact[N * 2];
bool used[N * 2];
void print(__int128 x) {
	if (x == 0) return cout << '0', void();
	string s;
	while (x) {
		s += char('0' + x % 10);
		x /= 10;
	}
	reverse(s.begin(), s.end());
	cout << s;
}
void __() {
	int n;
	cin >> n;
	for (int i = 0; i < n; i++) {
		cin >> p[i].x >> p[i].y >> p[i].z;
	}
	random_shuffle(p, p + n);
	__int128 ans = 0;
	while (n > 3) {
		int m = convex_hull(n, fact);
		for (int i = 0; i < m; i++) {
			ans += abs((p[fact[i].id[0]] - p[0]) * ((p[fact[i].id[1]] - p[fact[i].id[0]]) ^
													(p[fact[i].id[2]] - p[fact[i].id[0]])));
			used[fact[i].id[0]] = used[fact[i].id[1]] = used[fact[i].id[2]] = 1;
		}
		int cnt = 0;
		for (int i = 0; i < n; i++)
			if (!used[i]) p[cnt++] = p[i];
		for (int i = 0; i < n; i++) used[i] = 0;
		n = cnt;
	}
	print(ans);
	cout << '\n';
}
int main() {
	int T;
	cin >> T;
	while (T--) __();
	return 0;
}
```
## 数据结构
### 线段树2
```cpp
ll a[N], tr[N << 2], k;
struct node {
	ll add, mul;
} tag[N << 2];
void push_up(int u) { tr[u] = (tr[u << 1] + tr[u << 1 | 1]) % m; }
void build(int u, int l, int r) {
	tag[u].mul = 1;
	if (l == r) return tr[u] = a[l], void();
	int mid = l + r >> 1;
	build(u << 1, l, mid);
	build(u << 1 | 1, mid + 1, r);
	push_up(u);
}
void update_add(int u, ll add, int len) {
	tr[u] = (tr[u] + add * len % m) % m;
	tag[u].add = (tag[u].add + add) % m;
}
void update_mul(int u, ll mul) {
	tr[u] = tr[u] * mul % m;
	tag[u].add = tag[u].add * mul % m;
	tag[u].mul = tag[u].mul * mul % m;
}
void push_down(int u, int l, int r) {
	int mid = l + r >> 1;
	if (tag[u].mul != 1) update_mul(u << 1, tag[u].mul);
	update_mul(u << 1 | 1, tag[u].mul);
	if (tag[u].add != 0) update_add(u << 1, tag[u].add, mid - l + 1);
	update_add(u << 1 | 1, tag[u].add, r - mid);
	tag[u].add = 0;
	tag[u].mul = 1;
}
void add(int u, int l, int r, int L, int R, ll x) {
	if (l >= L && r <= R) return update_add(u, x, r - l + 1), void();
	push_down(u, l, r);
	int mid = l + r >> 1;
	if (mid >= L) add(u << 1, l, mid, L, R, x);
	if (mid < R) add(u << 1 | 1, mid + 1, r, L, R, x);
	push_up(u);
}
void mul(int u, int l, int r, int L, int R, ll x) {
	if (l >= L && r <= R) return update_mul(u, x), void();
	push_down(u, l, r);
	int mid = l + r >> 1;
	if (mid >= L) mul(u << 1, l, mid, L, R, x);
	if (mid < R) mul(u << 1 | 1, mid + 1, r, L, R, x);
	push_up(u);
}
int n, q, x, y, op;
ll query(int u, int l, int r, int L, int R) {
	if (l >= L && r <= R) return tr[u];
	push_down(u, l, r);
	ll res = 0;
	int mid = l + r >> 1;
	if (mid >= L) res += query(u << 1, l, mid, L, R);
	if (mid < R) res += query(u << 1 | 1, mid + 1, r, L, R);
	push_up(u);
	return res % m;
}
int main() {
	cin >> n >> q >> a[0];
	for (int i = 1; i <= n; i++) cin >> a[i];
	build(1, 1, n);
	for (int i = 1; i <= q; i++) {
		cin >> op >> x >> y;
		if (op != 3) cin >> k;
		if (op == 1)
			mul(1, 1, n, x, y, k);
		else if (op == 2)
			add(1, 1, n, x, y, k);
		else
			cout << query(1, 1, n, x, y) << endl;
	}
	return 0;
}
```
### 可持久化线段树
```cpp
struct Tree {
	struct Node {
		int ls, rs, sum;
		Node() : ls(0), rs(0), sum(0) {}
	} tr[N * 40];
	int root[N];
	int cnt = 0;
	void pushup(int u) { tr[u].sum = tr[tr[u].ls].sum + tr[tr[u].rs].sum; }
	void copy(int& u) {
		tr[++cnt] = tr[u];
		u = cnt;
	}
	void update(int& u, int l, int r, int x, int y) {
		copy(u);
		if (l == r) return tr[u].sum += y, void();
		int mid = (l + r) / 2;
		if (x <= mid)
			update(tr[u].ls, l, mid, x, y);
		else
			update(tr[u].rs, mid + 1, r, x, y);
		pushup(u);
	}
	int query(int u1, int u2, int l, int r, int k) {
		if (l == r) return l;
		int x = tr[tr[u1].ls].sum - tr[tr[u2].ls].sum, mid = (l + r) / 2;
		if (x >= k) return query(tr[u1].ls, tr[u2].ls, l, mid, k);
		return query(tr[u1].rs, tr[u2].rs, mid + 1, r, k - x);
	}
} tree;
void __() {
	int n, m;
	cin >> n >> m;
	for (int i = 1; i <= n; i++) {
		int x;
		cin >> x;
		tree.update(tree.root[i] = tree.root[i - 1], 0, INF, x, 1);
	}
	for (int i = 1; i <= m; i++) {
		int l, r, k;
		cin >> l >> r >> k;
		cout << tree.query(tree.root[r], tree.root[l - 1], 0, INF, k) << '\n';
	}
}
int main() {
	__();
	return 0;
}
```
### 线段树分裂
```cpp
int cnt, root[N];
struct Tree {
	ll sum;
	int ls, rs;
} t[N * 40];
void pushup(int u) { t[u].sum = t[t[u].ls].sum + t[t[u].rs].sum; }
void disintegrate(int& u1, int& u2, int l, int r, int L, int R) {
	u2 = ++cnt;
	if (l >= L && r <= R) return t[u2] = t[u1], u1 = 0, void();
	int mid = l + r >> 1;
	if (mid >= L) disintegrate(t[u1].ls, t[u2].ls, l, mid, L, R);
	if (mid + 1 <= R) disintegrate(t[u1].rs, t[u2].rs, mid + 1, r, L, R);
	pushup(u1);
	pushup(u2);
}
void combine(int& u1, int& u2, int l, int r) {
	if (!u1 || !u2) return u1 |= u2, void();
	if (l == r) return t[u1].sum += t[u2].sum, t[u2].sum = 0, void();
	int mid = l + r >> 1;
	combine(t[u1].ls, t[u2].ls, l, mid);
	combine(t[u1].rs, t[u2].rs, mid + 1, r);
	pushup(u1);
}
void insert(int& u, int l, int r, int x, int y) {
	if (!u) u = ++cnt;
	if (l == r) return t[u].sum += y, void();
	int mid = l + r >> 1;
	if (x <= mid)
		insert(t[u].ls, l, mid, x, y);
	else
		insert(t[u].rs, mid + 1, r, x, y);
	pushup(u);
}
ll query_sum(int u, int l, int r, int L, int R) {
	if (l >= L && r <= R) return t[u].sum;
	int mid = l + r >> 1;
	ll res = 0;
	if (mid >= L) res += query_sum(t[u].ls, l, mid, L, R);
	if (mid + 1 <= R) res += query_sum(t[u].rs, mid + 1, r, L, R);
	return res;
}
ll query_kth(int u, int l, int r, ll k) {
	if (t[u].sum < k) return -1;
	if (l == r) return l;
	int mid = l + r >> 1;
	ll x = t[t[u].ls].sum;
	if (x >= k) return query_kth(t[u].ls, l, mid, k);
	return query_kth(t[u].rs, mid + 1, r, k - x);
}
int n, m, res;
int main() {
	cin >> n >> m;
	for (int i = 1, x; i <= n; i++) {
		cin >> x;
		insert(root[1], 1, n, i, x);
	}
	res = 1;
	for (int i = 1, op, p, x, y; i <= m; i++) {
		cin >> op >> p;
		if (op == 0) {
			cin >> x >> y;
			disintegrate(root[p], root[++res], 1, n, x, y);
		} else if (op == 1) {
			cin >> x;
			combine(root[p], root[x], 1, n);
		} else if (op == 2) {
			cin >> x >> y;
			insert(root[p], 1, n, y, x);
		} else if (op == 3) {
			cin >> x >> y;
			cout << query_sum(root[p], 1, n, x, y) << '\n';
		} else {
			cin >> x;
			cout << query_kth(root[p], 1, n, x) << '\n';
		}
	}
	return 0;
}
```
### 线段树合并
```cpp
struct edge {
	int v, nxt;
} e[N * 2];
int _, head[N];
void addedge(int u, int v) {
	e[++_].v = v;
	e[_].nxt = head[u];
	head[u] = _;
}
int dn, dfn[N], st[20][N], lg[N];
void dfs1(int u, int fa) {
	st[0][dfn[u] = ++dn] = fa;
	for (int i = head[u]; i; i = e[i].nxt) {
		int v = e[i].v;
		if (v == fa) continue;
		dfs1(v, u);
	}
}
int get(int x, int y) { return dfn[x] < dfn[y] ? x : y; }
int lca(int x, int y) {
	if (x == y) return x;
	x = dfn[x];
	y = dfn[y];
	if (x > y) swap(x, y);
	x++;
	int k = lg[y - x + 1];
	return get(st[k][x], st[k][y - (1 << k) + 1]);
}
int cnt, root[N];
struct Tree {
	int maxx, id, ls, rs;
} t[N * 60];
void pushup(int u) {
	int ls = t[u].ls, rs = t[u].rs;
	if (t[ls].id > t[rs].id) swap(ls, rs);
	if (t[ls].maxx >= t[rs].maxx)
		t[u].maxx = t[ls].maxx, t[u].id = t[ls].id;
	else
		t[u].maxx = t[rs].maxx, t[u].id = t[rs].id;
}
void addpoint(int& u, int l, int r, int x, int y) {
	if (!u) u = ++cnt;
	if (l == r) return t[u].id = l, t[u].maxx += y, void();
	int mid = l + r >> 1;
	if (x <= mid)
		addpoint(t[u].ls, l, mid, x, y);
	else
		addpoint(t[u].rs, mid + 1, r, x, y);
	pushup(u);
}
void combine(int& u1, int& u2, int l, int r) {
	if (!u1 || !u2) return u1 |= u2, void();
	if (l == r) return t[u1].maxx += t[u2].maxx, t[u2].maxx = 0, void();
	int mid = l + r >> 1;
	combine(t[u1].ls, t[u2].ls, l, mid);
	combine(t[u1].rs, t[u2].rs, mid + 1, r);
	pushup(u1);
}
int ans[N];
void dfs2(int u, int fa) {
	for (int i = head[u]; i; i = e[i].nxt) {
		int v = e[i].v;
		if (v == fa) continue;
		dfs2(v, u);
		combine(root[u], root[v], 1, N);
	}
	ans[u] = t[root[u]].id;
}
int n, m;
int main() {
	cin >> n >> m;
	for (int i = 2; i <= n; i++) lg[i] = lg[i / 2] + 1;
	for (int i = 1, u, v; i <= n - 1; i++) {
		cin >> u >> v;
		addedge(u, v);
		addedge(v, u);
	}
	dfs1(1, 0);
	for (int k = 1; k <= lg[n]; k++)
		for (int i = 1; i + (1 << k) - 1 <= n; i++)
			st[k][i] = get(st[k - 1][i], st[k - 1][i + (1 << k - 1)]);
	for (int i = 1, x, y, z; i <= m; i++) {
		cin >> x >> y >> z;
		int f1 = lca(x, y), f2 = st[0][dfn[f1]];
		addpoint(root[x], 1, N, z, 1);
		addpoint(root[y], 1, N, z, 1);
		addpoint(root[f1], 1, N, z, -1);
		addpoint(root[f2], 1, N, z, -1);
	}
	dfs2(1, 0);
	for (int i = 1; i <= n; i++) cout << ans[i] << "\n";
	return 0;
}
```
### 字典树+扫描线
```cpp
int tot, mp[200];
struct Trie {
	int ch[5];
} tr[2][N];
bool vis[N];
int iden[2][N], tp;
struct P {
	int x, y;
	bool operator<(const P& boj) const { return x < boj.x; }
} p[N];
int insert(string str, int t) {
	int u = 0;
	for (int i = 0; i < str.size(); i++) {
		int c = mp[str[i]];
		if (!tr[t][u].ch[c]) tr[t][u].ch[c] = ++tot;
		u = tr[t][u].ch[c];
	}
	return u;
}
int dn, dfn[2][N], sz[2][N];
void dfs(int u, int t) {
	dfn[t][u] = ++dn;
	sz[t][u]++;
	for (int c = 1; c <= 4; c++) {
		if (!tr[t][u].ch[c]) continue;
		dfs(tr[t][u].ch[c], t);
		sz[t][u] += sz[t][tr[t][u].ch[c]];
	}
}
struct Q {
	int l, r, x, id, val;
	bool operator<(const Q& boj) const { return x < boj.x; }
} q[N];
int _;
void addq(int l, int r, int x, int id, int val) {
	q[++_].l = l;
	q[_].r = r;
	q[_].x = x;
	q[_].id = id;
	q[_].val = val;
}
int t[N * 4];
void pushup(int u) { t[u] = t[u << 1] + t[u << 1 | 1]; }
void add(int u, int l, int r, int x) {
	if (l == r) return t[u]++, void();
	int mid = l + r >> 1;
	if (x <= mid)
		add(u << 1, l, mid, x);
	else
		add(u << 1 | 1, mid + 1, r, x);
	pushup(u);
}
int query(int u, int l, int r, int L, int R) {
	if (l >= L && r <= R) return t[u];
	int mid = l + r >> 1, res = 0;
	if (mid >= L) res += query(u << 1, l, mid, L, R);
	if (mid + 1 <= R) res += query(u << 1 | 1, mid + 1, r, L, R);
	return res;
}
void makequery(string str1, string str2, int id) {
	int x, xx, y, yy, u = 0;
	bool f = 0;
	for (int i = 0; i < str1.size(); i++) {
		int c = mp[str1[i]];
		if (!tr[0][u].ch[c]) {
			f = 1;
			break;
		}
		u = tr[0][u].ch[c];
	}
	x = dfn[0][u];
	xx = dfn[0][u] + sz[0][u] - 1;
	u = 0;
	for (int i = 0; i < str2.size(); i++) {
		int c = mp[str2[i]];
		if (!tr[1][u].ch[c]) {
			f = 1;
			break;
		}
		u = tr[1][u].ch[c];
	}
	y = dfn[1][u];
	yy = dfn[1][u] + sz[1][u] - 1;
	if (f) x = -1, xx = -2;
	addq(y, yy, x - 1, id, -1);
	addq(y, yy, xx, id, 1);
}
int n, m, ans[N];
int main() {
	cin >> n >> m;
	mp['A'] = 1;
	mp['U'] = 2;
	mp['C'] = 3;
	mp['G'] = 4;
	for (int i = 1; i <= n; i++) {
		string s;
		cin >> s;
		p[i].x = insert(s, 0);
		reverse(s.begin(), s.end());
		p[i].y = insert(s, 1);
	}
	dfs(0, 0);
	dn = 0;
	dfs(0, 1);
	for (int i = 1; i <= n; i++) p[i].x = dfn[0][p[i].x], p[i].y = dfn[1][p[i].y];
	sort(p + 1, p + 1 + n);
	for (int i = 1; i <= m; i++) {
		string s1, s2;
		cin >> s1 >> s2;
		reverse(s2.begin(), s2.end());
		makequery(s1, s2, i);
	}
	sort(q + 1, q + 1 + _);
	for (int i = 1; i <= _; i++) {
		while (tp <= n && p[tp].x <= q[i].x) add(1, 0, N, p[tp].y), tp++;
		ans[q[i].id] += q[i].val * query(1, 0, N, q[i].l, q[i].r);
	}
	for (int i = 1; i <= m; i++) cout << ans[i] << '\n';
	return 0;
}
```
### 树套树（线段树套平衡树）
```cpp
#include <bits/stdc++.h>
using namespace std;
const int N = 5e4 + 100;
class Tree {
private:
	constexpr static int INF = 2147483647;

	class Treap {
	private:
		struct Treap_Node {
			Treap_Node* ch[2];
			int val, prio, cnt, siz;

			Treap_Node(int val) : val(val), cnt(1), siz(1) {
				ch[0] = ch[1] = nullptr;
				prio = rand();
			}

			void update_size() {
				siz = cnt;
				if (ch[0] != nullptr) siz += ch[0]->siz;
				if (ch[1] != nullptr) siz += ch[1]->siz;
			}
		};

		Treap_Node* root = nullptr;

		const bool LEFT = 1;
		const bool RIGHT = 0;

		void Treap_Rotate(Treap_Node*& cur, bool dir) {
			Treap_Node* tmp = cur->ch[dir];
			cur->ch[dir] = tmp->ch[!dir];
			tmp->ch[!dir] = cur;
			cur->update_size();
			tmp->update_size();
			cur = tmp;
		}

		void Treap_Insert(Treap_Node*& cur, int val) {
			if (cur == nullptr) {
				cur = new Treap_Node(val);
				return;
			} else if (val == cur->val) {
				cur->cnt++;
				cur->siz++;
			} else if (val < cur->val) {
				Treap_Insert(cur->ch[0], val);
				if (cur->ch[0]->prio < cur->prio) {
					Treap_Rotate(cur, RIGHT);
				}
				cur->update_size();
			} else {
				Treap_Insert(cur->ch[1], val);
				if (cur->ch[1]->prio < cur->prio) {
					Treap_Rotate(cur, LEFT);
				}
				cur->update_size();
			}
		}

		void Treap_Delete(Treap_Node*& cur, int val) {
			if (cur == nullptr) return;
			if (val < cur->val) {
				Treap_Delete(cur->ch[0], val);
				cur->update_size();
				return;
			} else if (val > cur->val) {
				Treap_Delete(cur->ch[1], val);
				cur->update_size();
				return;
			} else {
				if (cur->cnt > 1) {
					cur->cnt--;
					cur->siz--;
					return;
				}
			}

			int state = 0;
			state |= (cur->ch[0] != nullptr);
			state |= ((cur->ch[1] != nullptr) << 1);
			Treap_Node* tmp = cur;
			switch (state) {
				case 0:
					delete cur;
					cur = nullptr;
					break;
				case 1:
					cur = tmp->ch[0];
					delete tmp;
					break;
				case 2:
					cur = tmp->ch[1];
					delete tmp;
					break;
				case 3:
					bool dir = cur->ch[0]->prio < cur->ch[1]->prio ? RIGHT : LEFT;
					Treap_Rotate(cur, dir);
					Treap_Delete(cur->ch[!dir], val);
					cur->update_size();
					break;
			}
		}

		int Treap_Query_Rank(Treap_Node* cur, int val) {
			if (cur == nullptr) return 1;
			int less_size = cur->ch[0] == nullptr ? 0 : cur->ch[0]->siz;
			if (val == cur->val) {
				return less_size + 1;
			} else if (val < cur->val) {
				return Treap_Query_Rank(cur->ch[0], val);
			} else {
				return less_size + cur->cnt + Treap_Query_Rank(cur->ch[1], val);
			}
		}

		int Treap_Query_Value(Treap_Node* cur, int rank) {
			int less_size = cur->ch[0] == nullptr ? 0 : cur->ch[0]->siz;
			if (rank <= less_size)
				return Treap_Query_Value(cur->ch[0], rank);
			else if (rank > less_size + cur->cnt)
				return Treap_Query_Value(cur->ch[1], rank - less_size - cur->cnt);
			else
				return cur->val;
		}

		int Treap_Query_Prev(Treap_Node* cur, int val) {
			int ans = -INF;
			while (cur != nullptr) {
				if (cur->val < val) {
					ans = cur->val;
					cur = cur->ch[1];
				} else {
					cur = cur->ch[0];
				}
			}
			return ans;
		}

		int Treap_Query_Next(Treap_Node* cur, int val) {
			int ans = INF;
			while (cur != nullptr) {
				if (cur->val > val) {
					ans = cur->val;
					cur = cur->ch[0];
				} else {
					cur = cur->ch[1];
				}
			}
			return ans;
		}

	public:
		void insert(int val) { Treap_Insert(root, val); }
		void del(int val) { Treap_Delete(root, val); }
		int query_rank(int val) { return Treap_Query_Rank(root, val); }
		int query_val(int rank) { return Treap_Query_Value(root, rank); }
		int query_prev(int val) { return Treap_Query_Prev(root, val); }
		int query_next(int val) { return Treap_Query_Next(root, val); }
	} tr[N << 2];

	void Tree_Insert(int u, int l, int r, int pos, int val) {
		tr[u].insert(val);
		if (l == r) return;
		int mid = l + r >> 1;
		if (pos <= mid)
			Tree_Insert(u << 1, l, mid, pos, val);
		else
			Tree_Insert(u << 1 | 1, mid + 1, r, pos, val);
	}

	void Tree_Delete(int u, int l, int r, int pos, int val) {
		tr[u].del(val);
		if (l == r) return;
		int mid = l + r >> 1;
		if (pos <= mid)
			Tree_Delete(u << 1, l, mid, pos, val);
		else
			Tree_Delete(u << 1 | 1, mid + 1, r, pos, val);
	}

	int Tree_Query_Rank(int u, int l, int r, int L, int R, int val) {
		if (l >= L && r <= R) return tr[u].query_rank(val) - 1;
		int mid = l + r >> 1, res = 0;
		if (L <= mid) res += Tree_Query_Rank(u << 1, l, mid, L, R, val);
		if (R > mid) res += Tree_Query_Rank(u << 1 | 1, mid + 1, r, L, R, val);
		return res;
	}

	int Tree_Query_Prev(int u, int l, int r, int L, int R, int val) {
		if (l >= L && r <= R) return tr[u].query_prev(val);
		int mid = l + r >> 1, res = -INF;
		if (L <= mid) res = max(res, Tree_Query_Prev(u << 1, l, mid, L, R, val));
		if (R > mid) res = max(res, Tree_Query_Prev(u << 1 | 1, mid + 1, r, L, R, val));
		return res;
	}

	int Tree_Query_Next(int u, int l, int r, int L, int R, int val) {
		if (l >= L && r <= R) return tr[u].query_next(val);
		int mid = l + r >> 1, res = INF;
		if (L <= mid) res = min(res, Tree_Query_Next(u << 1, l, mid, L, R, val));
		if (R > mid) res = min(res, Tree_Query_Next(u << 1 | 1, mid + 1, r, L, R, val));
		return res;
	}

public:
	int n;

	void insert(int pos, int val) { Tree_Insert(1, 1, n, pos, val); }
	void del(int pos, int val) { Tree_Delete(1, 1, n, pos, val); }
	int query_rank(int L, int R, int val) { return Tree_Query_Rank(1, 1, n, L, R, val) + 1; }
	int query_val(int L, int R, int rank) {
		int l = 0, r = 1e8;
		while (l < r) {
			int mid = (l + r >> 1) + 1;
			if (query_rank(L, R, mid) <= rank)
				l = mid;
			else
				r = mid - 1;
		}
		return l;
	}
	int query_prev(int L, int R, int val) { return Tree_Query_Prev(1, 1, n, L, R, val); }
	int query_next(int L, int R, int val) { return Tree_Query_Next(1, 1, n, L, R, val); }
} tree;

int a[N];

int main() {
	ios::sync_with_stdio(0);
	cin.tie(0);
	srand(time(nullptr));
	int n, m;
	cin >> n >> m;
	tree.n = n;
	for (int i = 1; i <= n; i++) {
		cin >> a[i];
		tree.insert(i, a[i]);
	}
	while (m--) {
		int op, l, r, k;
		cin >> op;
		switch (op) {
			case 1:
				cin >> l >> r >> k;
				cout << tree.query_rank(l, r, k) << '\n';
				break;
			case 2:
				cin >> l >> r >> k;
				cout << tree.query_val(l, r, k) << '\n';
				break;
			case 3:
				cin >> l >> k;
				tree.del(l, a[l]);
				tree.insert(l, k);
				a[l] = k;
				break;
			case 4:
				cin >> l >> r >> k;
				cout << tree.query_prev(l, r, k) << '\n';
				break;
			case 5:
				cin >> l >> r >> k;
				cout << tree.query_next(l, r, k) << '\n';
				break;
		}
	}
	return 0;
}
```
### 分块
```cpp
int n, m;
int len, belong[N], L[N], R[N], tot;
ll a[N], maxx[N], sum[N];
void build() {
	len = sqrt(n);
	tot = n / len;
	if (n % len) tot++;
	for (int i = 1; i <= tot; i++) {
		L[i] = (i - 1) * len + 1;
		R[i] = i * len;
	}
	R[tot] = n;
	for (int i = 1; i <= n; i++) {
		belong[i] = (i - 1) / len + 1;
		sum[belong[i]] += a[i];
		maxx[belong[i]] = max(maxx[belong[i]], a[i]);
	}
}
ll mx;
ll sq(ll x) { return (ll)sqrt(x); }
void update(int x, int y) {
	if (belong[x] == belong[y]) {
		if (maxx[belong[x]] <= 1) return;
		for (int i = x; i <= y; i++) sum[belong[x]] += sq(a[i]) - a[i], a[i] = sq(a[i]);
		mx = 0;
		for (int i = L[belong[x]]; i <= R[belong[x]]; i++) mx = max(mx, a[i]);
		maxx[belong[x]] = mx;
		return;
	}
	if (maxx[belong[x]] > 1) {
		for (int i = x; i <= R[belong[x]]; i++) sum[belong[x]] += sq(a[i]) - a[i], a[i] = sq(a[i]);
		mx = 0;
		for (int i = L[belong[x]]; i <= R[belong[x]]; i++) mx = max(mx, a[i]);
		maxx[belong[x]] = mx;
	}
	if (maxx[belong[y]] > 1) {
		for (int i = L[belong[y]]; i <= y; i++) sum[belong[y]] += sq(a[i]) - a[i], a[i] = sq(a[i]);
		mx = 0;
		for (int i = L[belong[y]]; i <= R[belong[y]]; i++) mx = max(mx, a[i]);
		maxx[belong[y]] = mx;
	}
	for (int i = belong[x] + 1; i <= belong[y] - 1; i++) {
		if (maxx[i] <= 1) continue;
		for (int j = L[i]; j <= R[i]; j++) sum[i] += sq(a[j]) - a[j], a[j] = sq(a[j]);
		maxx[i] = sq(maxx[i]);
	}
	return;
}
ll query(int x, int y) {
	ll ans = 0;
	if (belong[x] == belong[y]) {
		for (int i = x; i <= y; i++) ans += a[i];
		return ans;
	}
	for (int i = x; i <= R[belong[x]]; i++) ans += a[i];
	for (int i = L[belong[y]]; i <= y; i++) ans += a[i];
	for (int i = belong[x] + 1; i <= belong[y] - 1; i++) ans += sum[i];
	return ans;
}
main() {
	cin >> n;
	for (int i = 1; i <= n; i++) cin >> a[i];
	build();
	cin >> m;
	for (int i = 1, k, l, r; i <= m; i++) {
		cin >> k >> l >> r;
		if (l > r) swap(l, r);
		if (k == 0)
			update(l, r);
		else
			cout << query(l, r) << '\n';
	}
	return 0;
}

```
## 动态规划
### 斜率优化
```cpp
typedef __int128_t i128;
const ll INF = 1e16;
int n, m, p;
ll a[N], dp[M][N], d[N], s[N], k;
ll cal(ll j, ll x) { return -j * x + dp[k - 1][j] + s[j]; }
bool check(ll x, ll y, ll z) {
	ll Bx = dp[k - 1][x] + s[x], By = dp[k - 1][y] + s[y], Bz = dp[k - 1][z] + s[z];
	return (i128)(Bx - By) * (x - z) >= (i128)(Bx - Bz) * (x - y);
}
void __() {
	cin >> n >> m >> p;
	for (int i = 2; i <= n; i++) {
		ll x;
		cin >> x;
		d[i] = d[i - 1] + x;
	}
	for (int i = 1; i <= m; i++) {
		ll h, t;
		cin >> h >> t;
		a[i] = t - d[h];
	}
	sort(a + 1, a + 1 + m);
	for (int i = 1; i <= m; i++) {
		s[i] = s[i - 1] + a[i];
		dp[0][i] = INF;
	}
	deque<int> deq;
	for (k = 1; k <= p; k++) {
		deq.clear();
		deq.push_back(0);
		for (int i = 1; i <= m; i++) {
			while (deq.size() >= 2 && cal(deq[0], a[i]) >= cal(deq[1], a[i])) {
				deq.pop_front();
			}
			int j = deq.front();
			if (dp[k - 1][j] == INF)
				dp[k][i] = INF;
			else
				dp[k][i] = i * a[i] - s[i] + cal(j, a[i]);
			if (dp[k - 1][i] != INF) {
				while (deq.size() >= 2 && check(deq[deq.size() - 2], deq[deq.size() - 1], i)) {
					deq.pop_back();
				}
				deq.push_back(i);
			}
		}
	}
	cout << dp[p][m];
}
int main() {
	ios::sync_with_stdio(0);
	cin.tie(0);
	__();
	return 0;
}
```
## 数学
### 线性基
```cpp
struct XOR_Basis {
	ll p[70]{};
	bool insert(ll x) {
		for (int i = 62; i >= 0; i--) {
			if (!(x >> i & 1)) continue;
			if (!p[i]) {
				p[i] = x;
				return 1;
			}
			x ^= p[i];
		}
		return 0;
	}
	bool contain(ll x) {
		for (int i = 62; i >= 0; i--) {
			if (!(x >> i & 1)) continue;
			if (!p[i]) return 0;
			x ^= p[i];
		}
		return 1;
	}
	ll getmax() {
		ll ans = 0;
		for (int i = 62; i >= 0; i--) {
			ans = max(ans, ans ^ p[i]);
		}
		return ans;
	}
} B;
int main() {
	int n;
	cin >> n;
	for (int i = 1; i <= n; i++) {
		ll x;
		cin >> x;
		if (!B.contain(x)) {
			B.insert(x);
		}
	}
	cout << B.getmax();
	return 0;
}
```
### 扩展欧几里得
```cpp
ll exgcd(ll a, ll b, ll& x, ll& y) {
	if (b == 0) {
		x = 1;
		y = 0;
		return a;
	}
	ll g = exgcd(b, a % b, y, x);
	y -= a / b * x;
	return g;
}
ll T, a, b, c;
using namespace std;
int main() {
	cin >> T;
	while (T--) {
		cin >> a >> b >> c;
		ll x, y;
		ll g = exgcd(a, b, x, y), gx = b / g, gy = a / g;
		if (c % g) {
			cout << "-1\n";
			continue;
		}
		x *= c / g;
		y *= c / g;
		ll s1 = ceil((1.0 - x) / gx), s2 = floor((y - 1.0) / gy);
		if (s1 <= s2) cout << s2 - s1 + 1 << " ";
		cout << x + s1 * gx << " " << y - s2 * gy << " ";
		if (s1 <= s2) cout << x + s2 * gx << " " << y - s1 * gy << " ";
		cout << '\n';
	}
	return 0;
}
```
### 中国剩余定理
```cpp
ll a[N], m[N], n, ans, M = 1;
void exgcd(ll a, ll b, ll& x, ll& y) {
	if (b == 0) {
		x = 1;
		y = 0;
		return;
	}
	exgcd(b, a % b, x, y);
	ll z = x;
	x = y;
	y = z - y * (a / b);
}
int main() {
	cin >> n;
	for (int i = 1; i <= n; i++) cin >> m[i] >> a[i], M *= m[i];
	for (int i = 1; i <= n; i++) {
		ll x = 0, y = 0, Mi = M / m[i];
		exgcd(Mi, m[i], x, y);
		ans = (ans + a[i] * Mi % M * ((x % m[i] + m[i]) % m[i]) % M) % M;
	}
	cout << ans;
	return 0;
}
```
### 扩展中国剩余定理
```cpp
ll mul(ll a, ll b, ll mod) {
	if (b < 0) return (-mul(a, -b, mod) % mod + mod) % mod;
	ll ans = 0;
	a = (a % mod + mod) % mod;
	for (; b; b >>= 1, a = a * 2 % mod)
		if (b & 1) ans = (ans + a) % mod;
	return ans;
}
ll exgcd(ll a, ll b, ll& x, ll& y) {
	if (b == 0) {
		x = 1;
		y = 0;
		return a;
	}
	ll g = exgcd(b, a % b, y, x);
	y -= a / b * x;
	return g;
}
int n;
ll a[N], b[N], ans, M;
ll excrt() {
	M = a[1];
	ans = b[1];
	for (int i = 2; i <= n; i++) {
		ll x, y, c = ((b[i] - ans) % a[i] + a[i]) % a[i], g = exgcd(M, a[i], x, y);
		// ax≡c(mod b) <=> ax+by=c
		if (c % g) return -1;
		a[i] /= g;
		c /= g;
		x = mul(x, c, a[i]);
		ans += x * M;
		M *= a[i];
		ans = (ans % M + M) % M;
	}
	return ans;
}
int main() {
	cin >> n;
	for (int i = 1; i <= n; i++) cin >> a[i] >> b[i];
	cout << excrt();
	return 0;
}
```
### 矩阵快速幂
```cpp
struct Mat {
	ll a[109][109];
	Mat() {
		for (int i = 0; i <= 100; i++)
			for (int j = 0; j <= 100; j++) a[i][j] = 0;
	}
	void build() {
		for (int i = 1; i <= 100; i++) a[i][i] = 1;
	}
	Mat operator*(const Mat& x) const {
		Mat z;
		for (int i = 1; i <= 100; i++)
			for (int j = 1; j <= 100; j++) {
				for (int k = 1; k <= 100; k++) z.a[i][j] += a[i][k] * x.a[k][j] % mod;
				z.a[i][j] %= mod;
			}
		return z;
	}
} a, ans;
int n;
ll k;
int main() {
	cin >> n >> k;
	for (int i = 1; i <= n; i++)
		for (int j = 1; j <= n; j++) cin >> a.a[i][j];
	ans.build();
	for (; k; k >>= 1, a = a * a)
		if (k & 1) ans = ans * a;
	for (int i = 1; i <= n; i++) {
		for (int j = 1; j <= n; j++) cout << ans.a[i][j] << " ";
		cout << '\n';
	}
	return 0;
}
```
### 高斯消元
```cpp
const double eps = 1e-6;
int n;
double a[N][N];
bool Gauss() {
	for (int i = 1; i <= n; i++) {
		int vis = i;
		for (int j = i + 1; j <= n; j++)
			if (fabs(a[j][i]) > fabs(a[vis][i])) vis = j;
		for (int j = 1; j <= n + 1; j++) swap(a[i][j], a[vis][j]);
		if (fabs(a[i][i]) < eps) return 0;
		for (int j = i + 1; j <= n + 1; j++) a[i][j] /= a[i][i];
		for (int j = 1; j <= n; j++)
			if (i != j)
				for (int k = i + 1; k <= n + 1; k++) a[j][k] -= a[j][i] * a[i][k];
	}
	return 1;
}
int main() {
	cin >> n;
	for (int i = 1; i <= n; i++)
		for (int j = 1; j <= n + 1; j++) cin >> a[i][j];
	if (Gauss())
		for (int i = 1; i <= n; i++) printf("%.2lf\n", a[i][n + 1] + eps);
	else
		printf("No Solution\n");
	return 0;
}
```
### FFT
```cpp
const double pi = acos(-1);
ll n, m, limit;
struct cpx {
	double r, i;
	cpx operator+(const cpx& a) const { return (cpx){r + a.r, i + a.i}; }
	cpx operator-(const cpx& a) const { return (cpx){r - a.r, i - a.i}; }
	cpx operator*(const cpx& a) const { return (cpx){r * a.r - i * a.i, r * a.i + i * a.r}; }
} a[N], b[N];
ll c[N];
ll read() {
	ll x = 0, tmp = 1;
	char ch = getchar();
	while (!isdigit(ch)) {
		if (ch == '-') tmp = -1;
		ch = getchar();
	}
	while (isdigit(ch)) {
		x = (x << 3) + (x << 1) + (ch ^ 48);
		ch = getchar();
	}
	return tmp * x;
}
void write(ll x) {
	if (x < 0) {
		putchar('-');
		x = -x;
	}
	ll y = 10, len = 1;
	while (y <= x) {
		y = (y << 3) + (y << 1);
		len++;
	}
	while (len--) {
		y /= 10;
		putchar(x / y + 48);
		x %= y;
	}
}
void FFT(cpx* a, ll op) {
	for (ll i = 0; i < limit; i++) {
		if (i < c[i]) swap(a[i], a[c[i]]);
	}
	for (ll mid = 1; mid < limit; mid <<= 1) {
		cpx W = cpx{cos(pi / mid), op * sin(pi / mid)};
		for (ll r = mid << 1, j = 0; j < limit; j += r) {
			cpx w = cpx{1, 0};
			for (ll l = 0; l < mid; l++, w = w * W) {
				cpx x = a[j + l], y = w * a[j + mid + l];
				a[j + l] = x + y;
				a[j + mid + l] = x - y;
			}
		}
	}
}
int main() {
	n = read();
	m = read();
	for (ll i = 0; i <= n; i++) a[i].r = read();
	for (ll i = 0; i <= m; i++) b[i].r = read();
	limit = 1;
	ll l = 0;
	while (limit <= n + m) {
		limit <<= 1;
		l++;
	}
	for (ll i = 0; i < limit; i++) c[i] = (c[i >> 1] >> 1) | ((i & 1) << (l - 1));
	FFT(a, 1);
	FFT(b, 1);
	for (ll i = 0; i <= limit; i++) a[i] = a[i] * b[i];
	FFT(a, -1);
	for (ll i = 0; i <= n + m; i++) {
		write(a[i].r / limit + 0.5);
		putchar(' ');
	}
	return 0;
}
```

### 类欧几里得算法
```cpp
struct node {
	ll cntu, cntr, sumi, sums, sqts, prd;
	node() { cntu = cntr = sumi = sums = sqts = prd = 0; }
	node operator*(node _) {
		node ans;
		(ans.cntu = cntu + _.cntu) %= mod;
		(ans.cntr = cntr + _.cntr) %= mod;
		(ans.sumi = sumi + _.sumi + cntr * _.cntr % mod) %= mod;
		(ans.sums = sums + _.sums + cntu * _.cntr % mod) %= mod;
		(ans.sqts = sqts + _.sqts + cntu * cntu % mod * _.cntr % mod + 2 * cntu * _.sums % mod) %=
			mod;
		(ans.prd = prd + _.prd + cntu * _.sumi % mod + cntr * _.sums % mod +
				   cntu * cntr % mod * _.cntr % mod) %= mod;
		return ans;
	}
	friend node operator^(node a, ll b) {
		node ans;
		for (; b; b >>= 1, a = a * a)
			if (b & 1) ans = ans * a;
		return ans;
	}
} U, R, ans;
ll cal(ll a, ll b, ll c, ll d) { return (a * b + c) / d; }
node solve(ll a, ll b, ll c, ll n, node A, node B) {
	if (n == 0) return node();
	if (a >= b) return solve(a % b, b, c, n, A, (A ^ (a / b)) * B);
	ll m = cal(n, a, c, b);
	if (m == 0) return B ^ n;
	ll cnt = n - cal(b, m, -c - 1, a);
	return (B ^ ((b - c - 1) / a)) * A * solve(b, a, (b - c - 1) % a, m - 1, B, A) * (B ^ cnt);
}
void __() {
	ll n, a, b, c;
	cin >> n >> a >> c >> b;
	ans = (U ^ (c / b)) * solve(a, b, c % b, n, U, R);
	cout << (ans.sums + c / b) % mod << " " << (ans.sqts + (c / b) * (c / b) % mod) % mod << " "
		 << ans.prd << '\n';
}
int main() {
	U.cntu = 1;
	R.cntr = 1;
	R.sumi = 1;
	int T;
	cin >> T;
	while (T--) __();
	return 0;
}
```
### 康托展开
```cpp
ll tr[N << 2];
void pushup(int u) { tr[u] = tr[u << 1] + tr[u << 1 | 1]; }
void update(int u, int l, int r, int x) {
	if (l == r) return tr[u]++, void();
	int mid = l + r >> 1;
	if (x <= mid)
		update(u << 1, l, mid, x);
	else
		update(u << 1 | 1, mid + 1, r, x);
	pushup(u);
}
ll query(int u, int l, int r, int L, int R) {
	if (l >= L && r <= R) return tr[u];
	int mid = l + r >> 1;
	ll res = 0;
	if (L <= mid) res += query(u << 1, l, mid, L, R);
	if (R > mid) res += query(u << 1 | 1, mid + 1, r, L, R);
	return res;
}
ll n, a[N], fac[N], s[N], ans = 1;
int main() {
	cin >> n;
	for (int i = 1; i <= n; i++) cin >> a[i];
	fac[0] = 1;
	for (int i = 1; i <= n; i++) fac[i] = fac[i - 1] * i % mod;
	for (int i = n; i >= 1; i--) {
		(ans += query(1, 1, n, 1, a[i]) * fac[n - i] % mod) %= mod;
		update(1, 1, n, a[i]);
	}
	cout << ans;
	return 0;
}
```
## 字符串
### 哈希
```cpp
const int H = 131;
int n, m, T, ans;
string s0, s;
ull p[N], f[N], g[N];
ull haxi(ull* k, int l, int r) { return k[r] - k[l - 1] * p[r - l + 1]; }
int ef(int x, int y, int r) {
	int l = 1, length = 0;
	while (l <= r) {
		int mid = (l + r) >> 1;
		if (haxi(f, x, x + mid - 1) == haxi(g, y, y + mid - 1))
			length = mid, l = mid + 1;
		else
			r = mid - 1;
	}
	return length;
}
bool check(int x) {
	int r = x + m - 1, y = 1, cnt = 1;
	while (y <= m) {
		if (cnt > 4) return 0;
		int len = ef(x, y, m - y + 1);
		x += len + 1;
		y += len + 1;
		cnt++;
	}
	return 1;
}
int main() {
	cin >> T;
	while (T--) {
		s0 = "1", s = "2";
		string a;
		cin >> a;
		s0 += a;
		cin >> a;
		s += a;
		n = s0.size(), m = s.size();
		if (s0.size() < s.size()) {
			printf("0\n");
			continue;
		}
		p[0] = 1;
		for (int i = 1; i <= n; i++) p[i] = p[i - 1] * H;
		for (int i = 1; i <= n; i++) f[i] = f[i - 1] * H + s0[i];
		for (int i = 1; i <= m; i++) g[i] = g[i - 1] * H + s[i];
		ans = 0;
		for (int i = 1; i + m - 1 <= n; i++)
			if (check(i)) ans++;
		printf("%d\n", ans);
	}
	return 0;
}
```
### KMP
```cpp
int pmt[N];
string s, p;
void getpmt() {
	for (int i = 1, j = 0; i < p.size(); i++) {
		while (j && p[i] != p[j]) j = pmt[j - 1];
		if (p[i] == p[j]) j++;
		pmt[i] = j;
	}
}
void kmp() {
	for (int i = 0, j = 0; i < s.size(); i++) {
		while (j && s[i] != p[j]) j = pmt[j - 1];
		if (s[i] == p[j]) j++;
		if (j == p.size()) {
			cout << i - j + 2 << '\n';
			j = pmt[j - 1];
		}
	}
}
int main() {
	cin >> s >> p;
	getpmt();
	kmp();
	for (int i = 0; i < p.size(); i++) cout << pmt[i] << " ";
	return 0;
}
```
## 杂项
### 莫队
```cpp
ll len;
struct Query {
	int l, r, id;
	bool operator<(const Query& x) const {
		if (l / len == x.l / len) {
			if (l / len % 2)
				r > x.r;
			else
				r < x.r;
		}
		return l < x.l;
	}
} q[N];
ll n, m, k, a[N], cnt[N], ans[N], tot;
void add(int pos) {
	cnt[a[pos]]++;
	tot += cnt[a[pos]] * 2 - 1;
}
void del(int pos) {
	tot -= cnt[a[pos]] * 2 - 1;
	cnt[a[pos]]--;
}
int curl = 1, curr = 0;
void Mo() {
	sort(q + 1, q + 1 + m);
	for (int i = 1; i <= m; i++) {
		while (curl > q[i].l) add(--curl);
		while (curr < q[i].r) add(++curr);
		while (curl < q[i].l) del(curl++);
		while (curr > q[i].r) del(curr--);
		ans[q[i].id] = tot;
	}
}
int main() {
	cin >> n >> m >> k;
	len = n / sqrt(m);
	for (int i = 1; i <= n; i++) cin >> a[i];
	for (int i = 1; i <= m; i++) cin >> q[i].l >> q[i].r, q[i].id = i;
	Mo();
	for (int i = 1; i <= m; i++) cout << ans[i] << '\n';
	return 0;
}
```
### 树上莫队
```cpp
vector<int> e[N];
int dn, dfn[N], st[30][N];
int elr, euler[N], ste[N], ede[N];
void dfs(int u, int fa) {
	st[0][dfn[u] = ++dn] = fa;
	euler[ste[u] = ++elr] = u;
	for (int v : e[u]) {
		if (v == fa) continue;
		dfs(v, u);
	}
	euler[ede[u] = ++elr] = u;
}
int get(int x, int y) { return dfn[x] < dfn[y] ? x : y; }
int lg[N];
int lca(int u, int v) {
	if (u == v) return u;
	u = dfn[u];
	v = dfn[v];
	if (u > v) swap(u, v);
	u++;
	int k = lg[v - u + 1];
	return get(st[k][u], st[k][v - (1 << k) + 1]);
}
const int B = 3000;
struct Query {
	int l, r, t, extra, id;
	Query() {}
	Query(int l, int r, int t, int extra, int id) : l(l), r(r), t(t), extra(extra), id(id) {}
	bool operator<(const Query& other) const {
		if (l / B == other.l / B) {
			if (r / B == other.r / B) return ((r / B) & 1) ? (t > other.t) : (t < other.t);
			return ((l / B) & 1) ? (r > other.r) : (r < other.r);
		}
		return l < other.l;
	}
} q[N];
bool vis[N];
ll cnt[N], curans, v[N], w[N];
int curl = 1, curr = 0, curt = 0, col[N];
void update(int x) {
	int u = euler[x];
	vis[u] ^= 1;
	if (vis[u]) {
		cnt[col[u]]++;
		curans += v[col[u]] * w[cnt[col[u]]];
	} else {
		curans -= v[col[u]] * w[cnt[col[u]]];
		cnt[col[u]]--;
	}
}
int change_id[N], change_col[N];
void change(int t) {
	int u = change_id[t], c = change_col[t];
	if (vis[u]) {
		curans -= v[col[u]] * w[cnt[col[u]]];
		cnt[col[u]]--;
		cnt[c]++;
		curans += v[c] * w[cnt[c]];
	}
	swap(change_col[t], col[u]);
}
ll ans[N];
int n, m, p;
void Captain_Mo() {
	int tcnt = 0, qcnt = 0;
	for (int o = 1; o <= p; o++) {
		int op;
		cin >> op;
		if (op == 1) {
			qcnt++;
			int u, v;
			cin >> u >> v;
			if (dfn[u] > dfn[v]) swap(u, v);
			if (u == lca(u, v))
				q[qcnt] = Query(ste[u], ste[v], tcnt, -1, qcnt);
			else
				q[qcnt] = Query(ede[u], ste[v], tcnt, lca(u, v), qcnt);
		} else {
			tcnt++;
			cin >> change_id[tcnt] >> change_col[tcnt];
		}
	}
	sort(q + 1, q + 1 + qcnt);
	for (int o = 1; o <= qcnt; o++) {
		while (curr < q[o].r) update(++curr);
		while (curl > q[o].l) update(--curl);
		while (curr > q[o].r) update(curr--);
		while (curl < q[o].l) update(curl++);
		while (curt < q[o].t) change(++curt);
		while (curt > q[o].t) change(curt--);
		ans[q[o].id] = curans;
		if (q[o].extra != -1) ans[q[o].id] += v[col[q[o].extra]] * w[cnt[col[q[o].extra]] + 1];
	}
	for (int i = 1; i <= qcnt; i++) cout << ans[i] << '\n';
}
void __() {
	cin >> n >> m >> p;
	for (int i = 1; i <= m; i++) cin >> v[i];
	for (int i = 1; i <= n; i++) cin >> w[i];
	for (int i = 1; i <= n - 1; i++) {
		int u, v;
		cin >> u >> v;
		e[u].push_back(v);
		e[v].push_back(u);
	}
	for (int i = 1; i <= n; i++) cin >> col[i];
	dfs(1, 0);
	for (int i = 2; i <= n; i++) lg[i] = lg[i / 2] + 1;
	for (int k = 1; k <= lg[n]; k++) {
		for (int i = 1; i + (1 << k) - 1 <= n; i++) {
			st[k][i] = get(st[k - 1][i], st[k - 1][i + (1 << k - 1)]);
		}
	}
	Captain_Mo();
}
```
### 回滚莫队
```cpp
ll n, m, a[N], to[N], len, cnt[N], ansl, ansr, ans[N], curl, curr, lt;
struct Query {
	int l, r, id;
	bool operator<(const Query& x) const {
		if ((l - 1) / len == (x.l - 1) / len) return r < x.r;
		return l < x.l;
	}
} q[N];
void addl(int pos) {
	cnt[a[pos]]++;
	ansl = max(ansl, cnt[a[pos]] * to[a[pos]]);
}
void addr(int pos) {
	cnt[a[pos]]++;
	ansr = max(ansr, cnt[a[pos]] * to[a[pos]]);
}
void del(int pos) { cnt[a[pos]]--; }
void cal(int x, int y) {
	for (int i = x; i <= y; i++) addl(i);
	for (int i = x; i <= y; i++) del(i);
}
void Mo() {
	len = sqrt(n);
	sort(q + 1, q + 1 + m);
	lt = -1;
	for (int i = 1; i <= m; i++) {
		if (q[i].l > lt) {
			for (int j = 1; j <= n; j++) cnt[j] = 0;
			curl = lt = ((q[i].l - 1) / len + 1) * len;
			curr = curl - 1;
			ansr = 0;
		}
		ansl = 0;
		if (q[i].r <= lt) {
			cal(q[i].l, q[i].r);
			ans[q[i].id] = ansl;
			continue;
		}
		while (curl < lt) del(curl++);
		while (curr < q[i].r) addr(++curr);
		while (curl > q[i].l) addl(--curl);
		ans[q[i].id] = max(ansl, ansr);
	}
}
int main() {
	cin >> n >> m;
	map<int, int> mp;
	set<int> st;
	for (int i = 1; i <= n; i++) {
		cin >> a[i];
		st.insert(a[i]);
	}
	int cn = 0;
	for (auto x : st) {
		mp[x] = ++cn;
		to[cn] = x;
	}
	for (int i = 1; i <= n; i++) a[i] = mp[a[i]];
	for (int i = 1; i <= m; i++) cin >> q[i].l >> q[i].r, q[i].id = i;
	Mo();
	for (int i = 1; i <= m; i++) cout << ans[i] << '\n';
	return 0;
}
```
### 决策树
```cpp
int match(string a, string b) {
	int res = 0;
	for (int i = 0; i < 4; i++) res += (a[i] == b[i]);
	return res;
}
vector<string> queries[10];
struct Hash {
	size_t operator()(const vector<string>& v) const {
		size_t h = 0;
		for (auto& s : v) {
			for (char c : s) {
				h = h * 131 + c;
			}
		}
		return h;
	}
};
unordered_map<vector<string>, string, Hash> solution;
// map<vector<string>, string> solution;
int cnt;
bool dfs(const vector<string>& state, int depth, int opt) {
	if (state.size() == 1) return 1;
	if (depth == 0) return 0;
	cnt++;
	for (const string& query : queries[opt]) {
		vector<string> nxt[5];
		for (const string& answer : state) {
			int ret = match(query, answer);
			nxt[ret].push_back(answer);
		}
		bool ok = 1;
		for (int ret = 0; ret <= 4; ret++) {
			if (!nxt[ret].empty()) {
				if (!dfs(nxt[ret], depth - 1, opt)) {
					ok = 0;
					break;
				}
			}
		}
		if (ok) {
			if (!solution.count(state)) solution[state] = query;
			return 1;
		}
	}
	return 0;
}
vector<string> start_state[10];
void init() {
	string s = "0000";
	for (s[0] = '1'; s[0] <= '4'; s[0]++) {
		for (s[1] = '1'; s[1] <= '4'; s[1]++) {
			for (s[2] = '1'; s[2] <= '4'; s[2]++) {
				for (s[3] = '1'; s[3] <= '4'; s[3]++) {
					if (s[0] == s[1] && s[0] == s[2] && s[0] == s[3]) continue;
					queries[4].push_back(s);
				}
			}
		}
	}
	for (s[0] = '1'; s[0] <= '3'; s[0]++) {
		for (s[1] = '1'; s[1] <= '3'; s[1]++) {
			for (s[2] = '1'; s[2] <= '3'; s[2]++) {
				for (s[3] = '1'; s[3] <= '3'; s[3]++) {
					if (s[0] == s[1] && s[0] == s[2] && s[0] == s[3]) continue;
					queries[3].push_back(s);
				}
			}
		}
	}
	for (s[0] = '1'; s[0] <= '2'; s[0]++) {
		for (s[1] = '1'; s[1] <= '2'; s[1]++) {
			for (s[2] = '1'; s[2] <= '2'; s[2]++) {
				for (s[3] = '1'; s[3] <= '2'; s[3]++) {
					if (s[0] == s[1] && s[0] == s[2] && s[0] == s[3]) continue;
					queries[2].push_back(s);
				}
			}
		}
	}
	for (s[0] = '1'; s[0] <= '1'; s[0]++) {
		for (s[1] = '1'; s[1] <= '1'; s[1]++) {
			for (s[2] = '1'; s[2] <= '1'; s[2]++) {
				for (s[3] = '1'; s[3] <= '1'; s[3]++) {
					if (s[0] == s[1] && s[0] == s[2] && s[0] == s[3]) continue;
					queries[1].push_back(s);
				}
			}
		}
	}
	set<string> st[10];
	s = "1234";
	do {
		start_state[1].push_back(s);
	} while (next_permutation(s.begin(), s.end()));
	s = "1233";
	do {
		start_state[2].push_back(s);
	} while (next_permutation(s.begin(), s.end()));
	s = "1222";
	do {
		start_state[3].push_back(s);
	} while (next_permutation(s.begin(), s.end()));
	s = "1122";
	do {
		start_state[4].push_back(s);
	} while (next_permutation(s.begin(), s.end()));
	s = "1111";
	do {
		start_state[5].push_back(s);
	} while (next_permutation(s.begin(), s.end()));
	dfs(start_state[1], 3, 4);
	dfs(start_state[2], 3, 3);
	dfs(start_state[3], 3, 2);
	dfs(start_state[4], 3, 2);
	dfs(start_state[5], 3, 1);
}
int a[20];
char nota[300];
void output(string s) {
	for (int i = 0; i < 4; i++) {
		cout << nota[s[i]];
	}
	cout << '\n';
}
void dfs2(const vector<string>& state) {
	if (state.size() == 1) {
		cout << "! ";
		output(state[0]);
		return;
	}
	string s = solution[state];
	cout << "? ";
	output(s);
	int ret;
	cin >> ret;
	vector<string> nxt;
	for (string answer : state) {
		if (ret == match(answer, s)) nxt.push_back(answer);
	}
	dfs2(nxt);
}
void __() {
	int sum = 0;
	vector<pair<int, char>> vec;
	for (int i = 1; i <= 9; i++) {
		cout << "? " << i << i << i << i << '\n';
		cin >> a[i];
		sum += a[i];
		if (a[i]) {
			vec.push_back(make_pair(a[i], i + '0'));
		}
	}
	a[0] = 4 - sum;
	if (a[0]) {
		vec.push_back(make_pair(a[0], '0'));
	}
	sort(vec.begin(), vec.end());
	string S;
	for (int i = 0; i < vec.size(); i++) {
		nota[i + '1'] = vec[i].second;
		S += char(vec[i].first + '0');
	}
	vector<string> this_state;
	if (S == "1111") {
		this_state = start_state[1];
	} else if (S == "112") {
		this_state = start_state[2];
	} else if (S == "13") {
		this_state = start_state[3];
	} else if (S == "22") {
		this_state = start_state[4];
	} else {
		this_state = start_state[5];
	}
	dfs2(this_state);
}
int main() {
	init();
	int T;
	cin >> T;
	while (T--) __();
	return 0;
}
```