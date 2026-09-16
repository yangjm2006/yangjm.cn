## 多项式

$$
最基础的数学对象.
$$

+ 数系（自然数、整数、有理数、实数、复数）
+ 代数结构（群、环、域、向量空间）

多项式是连接它们的第一个纽带.

### 插值

给定 $n$ 个 $x$ 坐标不同的点，恰好可以用唯一的 $n-1$ 次多项式穿过.

相应地，一个 $n-1$ 次多项式，可以由 $n$ 个 $x$ 坐标不同的点确定.

### 范德蒙德行列式

### 拉格朗日插值

### 快速傅里叶变换

### 快速数论变换

## 生成函数

$$
无穷多项的多项式，成为函数与数列之间的桥梁.
$$

$$
\begin{align}
f(x)&=a_0+a_1x+a_2x^2+a_3x^3+\cdots \\
&= \sum_{i=0}^{+\infty} a_ix^i
\end{align}
$$

等于号的含义：在某个范围内（如 $0<x<1$ ），等号左右“要多接近有多接近”.

当 $a=[1,1,1,\dots]$ 时，

$$
F(x)=\sum_{i=0}^{+\infty} x^i=\frac{1}{1-x}
$$

又，

$$
\frac{1}{1-ax}=\sum_{i=0}^{+\infty} a^ix^i
$$

当 $a=[0,1,1,2,3,5,8,13,\dots]$ ，即斐波那契数列时，

$$
\begin{align}
F(x)&=\sum_{i=0}^{+\infty} a_ix^i & (1)\\
xF(x)&=\sum_{i=0}^{+\infty} a_ix^{i+1} & (2)\\
x^2F(x)&=\sum_{i=0}^{+\infty} a_ix^{i+2} & (3)
\end{align}
$$

由 $(1)-(2)-(3)$ 得，

$$
x=(1-x-x^2)F(x)
$$

即，

$$F(x)=\frac{x}{1-x-x^2}$$

又，

$$
\frac{x}{1-x-x^2}=\frac{1}{\sqrt{5}}\cdot(\frac{1}{1-(\frac{1+\sqrt{5}}{2})x}-\frac{1}{1-(\frac{1-\sqrt{5}}{2})x})
$$

故，

$$
a_n=\frac{1}{\sqrt{5}}\cdot[(\frac{1+\sqrt{5}}{2})^n-(\frac{1-\sqrt{5}}{2})^n]
$$

+ $c\cdot f(x) \to$ 数列倍增
+ $x\cdot f(x) \to$ 数列右移
+ $[f(x)-f(0)] \div x \to$ 数列左移
+ $f_1(x)\pm f_2(x) \to$ 数列求和/差

### 数列卷积

$$
F(x)=\sum_{i=0}^{+\infty}a_ix^i ~~~G(x)=\sum_{i=0}^{+\infty}b_ix^i
$$

$$
F(x)\cdot G(x)=\sum_{k=0}^{+\infty}\sum_{i=0}^{k}a^{i}b^{k-i}x^k
$$

特别地，

$$
F(x)=\sum_{i=0}^{+\infty}a_ix^i
$$

$$
\frac{1}{1-x} \cdot F(x)=\sum_{k=0}^{+\infty}\sum_{i=0}^{k}a_ix^k
$$

即对数列进行前缀和.

通过 $n-1$ 次前缀和，可以得到

### 二项式定理扩展

$$
(1-x)^{-n}=\sum_{i=0}^{+\infty}\binom{n-1+i}{n-1}x^i
$$

另外还可以这样理解：

$$
\begin{align}
\frac{1}{(1-x)^n}&=\frac{1}{1-x}\cdot\frac{1}{1-x}\cdot\ldots\cdot\frac{1}{1-x}\\
&=\left(\sum_{e_1\geq0}x^{e_1}\right)\left(\sum_{e_2\geq0}x^{e_2}\right)\dots\left(\sum_{e_n\geq0}x^{e_n}\right)\\
&=\sum_{e_1+e_2+\dots+e_n=m}x^m\\
&=\binom{n-1+m}{m}x^m
\end{align}
$$

$x^m$ 的系数即为满足 $e_1+e_2+\dots+e_n=m$ 的解的个数.

更一般地，

### 广义牛顿二项式定理

$$(x+y)^\alpha=\sum_{i=0}^{+\infty}\binom{\alpha}{i}x^{\alpha-i}y^i$$

其中，

$$
\binom{n}{m}=\frac{n(n-1)\cdots(n-m+1)}{m!}=\frac{(n)_m}{m!}
$$

### 多项式定理

$$
(x_1+x_2+\dots+x_n)^m=\sum_{\alpha_1+\alpha_2+\dots+\alpha_n=k}\frac{m!}{\alpha_1!\alpha_2!\cdots\alpha_n!}x_1^{\alpha_1}x_2^{\alpha_2}\cdots x_n^{\alpha_n}
$$

证明如下：

$$
\begin{align}
(x_1+x_2+\dots+x_n)^m&=\left((x_1+x_2+\cdots+x_{n-1})+x_n\right)^m\\
&=\sum_{\alpha_n\geq 0}^m\binom{m}{\alpha_n}x_n^{\alpha_n}(x_1+x_2+\cdots+x_{n-1})^{m-\alpha_n}\\
&=\sum_{\alpha_1+\alpha_2+\cdots+\alpha_n=m}\left.\binom{m}{\alpha_n}\binom{m-\alpha_n}{\alpha_{n-1}}\cdots\binom{m-\alpha_n-\cdots-\alpha_2}{\alpha_1}\right.\\
&=\sum_{\alpha_1+\alpha_2+\dots+\alpha_n=k}\frac{m!}{\alpha_1!\alpha_2!\cdots\alpha_n!}x_1^{\alpha_1}x_2^{\alpha_2}\cdots x_n^{\alpha_n}
\end{align}
$$

### 卡特兰数

递归定义：

$$
C_0=C_1=1\\
C_n=\sum_{i=0}^{n-1}C_iC_{n-1-i},n\geq2\\
$$

递推公式：

$$
C_n=\frac{4n-2}{n+1}C_{n-1}
$$

通项公式：

$$
C_n=\frac1{n+1}\binom{2n}{n}=\binom{2n}{n}-\binom{2n}{n-1}=\frac1{n+1}\sum_{i=0}^{n}\binom{n}{i}^2
$$

利用生成函数证明：

$$
\binom{2n}{n}=\sum_{i=0}^{n}\binom{n}{i}^2
$$

由二项式定理：

$$
\begin{align}
(1+x)^n&=\sum_{i=0}^{n}\binom{n}{i}x^i\\
(1+\frac1x)^n&=\sum_{i=0}^{n}\binom{n}{i}x^{-i}
\end{align}
$$

观察 $(1+x)^n\cdot(1+\frac1x)^n$ 中常数项为 $\sum_{i=0}^n\binom{n}{i}^2$ .

又， $(1+x)^n\cdot(1+\frac1x)^n=\frac{(1+x)^{2n}}{x^n}$
中常数项为 $\binom{2n}{n}$ .

故，两者相等.

利用生成函数证明卡特兰数通项公式：

设卡特兰数的生成函数为：

$$
\begin{align}
G(x)&=\sum_{i=0}^{+\infty}C_ix^i\\
&=C_0+C_1x+C_2x^2+\cdots+C_nx^n+\cdots
\end{align}
$$

那么，

$$
\begin{align}
G^2(x)&=\sum_{k=0}^{+\infty}\sum_{i=0}^{k}C_iC_{k-i}x^k\\
&=1+C_2x+C_3x^2+\cdots+C_{n+1}x^n+\cdots
\end{align}
$$

故，

$$
xG^2(x)-G(x)+1=0
$$

将其看作关于 $G(x)$ 的二次函数，解得：

$$
G(x)=\frac{1\pm\sqrt{1-4x}}{2x}
$$

又根据 $G(0)=1$ , $\lim_{x\to0}\frac{1-\sqrt{1-4x}}{2x}=1$

故，

$$
G(x)=\frac{1-\sqrt{1-4x}}{2x}
$$

由泰勒展开

$$
(1+x)^\alpha=1+\sum_{n=1}^{+\infty}\frac{\alpha(\alpha-1)\cdots(\alpha-n+1)}{n!}x^n
$$

得到：

$$
\begin{align}
G(x)&=\frac{1}{2x}\sum_{n=1}^{+\infty}\frac{(-1)^n(\frac12)(1-\frac12)(2-\frac12)\cdots(n-\frac32)}{n!}(-4x)^n\\
&=\frac1{2x}\sum_{n=1}^{+\infty}\frac{(2n-3)!!}{2^nn!}(4x)^n\\
&=\frac1{2x}\sum_{n=1}^{+\infty}\frac{(2n-2)!}{2^nn!(2n-2)!!}(4x)^n\\
&=\frac1{2x}\sum_{n=1}^{+\infty}\frac{(2n-2)!}{n(n-1)!(n-1)!}x^n\\
&=\frac1{2x}\sum_{n=1}^{+\infty}\frac{1}{n}\binom{2n-2}{n-1}x^n\\
&=\frac1{2x}\sum_{n=0}^{+\infty}\frac1{n+1}\binom{2n}{n}x^n
\end{align}
$$

故，

$$C_n=\frac1{n+1}\binom{2n}{n}$$

### 指数生成函数

$$
f(x)=\sum_{i=0}^{+\infty}a_i\frac{x^i}{i!}
$$

特别地，

$$
e^x=\sum_{i=0}^{+\infty}\frac{x^i}{i!}
$$

而该种生成函数的卷积可以将系数乘上组合数：

$$F(x)=\sum_{i=0}^{+\infty}a_i\frac{x^i}{i!}~~~G(x)=\sum_{i=0}^{+\infty}b_i\frac{x^i}{i!}$$

$$
\begin{align}
F(x) \cdot G(x)
&=\sum_{k=0}^{+\infty}\sum_{i=0}^{k}\frac{k!}{i!(k-i)!}a_ib_{k-i}\frac{x^k}{k!}\\
&=\sum_{k=0}^{+\infty}\sum_{i=0}^{k}\binom{k}{i}a_ib_{k-i}\frac{x^k}{k!}
\end{align}
$$

### Dirichlet级数生成函数

$$
F(s)=\sum_{i=1}^{+\infty}\frac{a_i}{i^s}
$$

而该种生成函数的卷积在数论方面有重要用途：

$$
F(s)=\sum_{i=1}^{+\infty}\frac{a_i}{i^s}~~~G(s)=\sum_{i=1}^{+\infty}\frac{b_i}{i^s}
$$

$$
F(s)\cdot G(s)=\sum_{k=1}^{+\infty}\frac{\sum_{i|k}a_ib_{k/i}}{k^s}
$$

特别地，

$$
F(s)=\sum_{i=1}^{+\infty}\frac{1}{i^s}
$$

$$
F^2(s)=\sum_{k=1}^{+\infty}\frac{d(k)}{k^s}
$$

其中， $d(k)$ 代表 $k$ 的约数个数.

例题：求长度为 $n$ 的 $01$ 字符串中的不可分解的字符串的个数

- “不可分解”指不能写成两个或多个相同字符串的拼接
  + “100100100” = “100” * 3  可分解
  + “1110”  不可分解

设 $f(x)$ 代表长度为 $x$ 的不可分解的 $01$ 字符串的数量.

因为将任意一个 $01$ 字符串分解为一个不可分解的 $01$ 字符串的方式唯一.

故，

$$2^n=\sum_{i|n}f(i)$$

利用莫比乌斯反演可得，

$$f(n)=\sum_{i|n}\mu (\frac{n}{i})\cdot 2^i$$
