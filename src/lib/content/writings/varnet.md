---
title: 'Fourier-based methods for Variable Astronomy'
date: 2024-11-07
---

![](varnet/hero.mp4)

M. Paz

*The Astronomical Journal* Volume 168, Number 6, article 241, 18 pp. (2024)

[View paper on Institute of Physics](https://iopscience.iop.org/article/10.3847/1538-3881/ad7fe6)

##

Fast and effective series analysis is at the heart of reliable variable astronomy. My 2023 paper describes in detail how this was implemented specifically for the archival NEOWISE mission. However, there are some generalizeable ideas I stumbled across, the best of which I'd say is the *FEFT*.

# The Finite Embedding Fourier Transform

One small algorithmic innovation that produced great results was the FEFT - *finite embedding Fourier transform*. It's relatively simple, but it solves a real issue with deep models and traditional signal processing methods.

The core problem is that standard feed-forward blocks or networks are operators on vector spaces of **definite** size.

$$
f_{FF}: \mathbb{R}^m \to \mathbb{R}^n
$$

Such a function $f_{FF}$ has no natural generalization to input spaces of dimension $\neq m$, unless you can say something about the preservation of coordinates.

This is inconvenient in timeseries analysis, where series of the same type might have wildly differing entry counts.

One solution to this is the convolutional network, which consists of fixed-size kernels slid across the data. However, this still yields a dimension dependent on the input dimension:

$$
f_{CNN}(S): \mathbb{R}^m \to \mathbb{R}^{m/S}
$$
for a sufficiently padded, zero dilation convolution over one dimension.

This is pesky-- without some pooling or aggregation step, you won't be able to directly use a fixed-size feedforward block afterward. In addition, it suffers the typical shortcomings of shallow CNNs, such as limited receptive fields in shallow networks.

Really, we want an operator which can accept a variable-dimension input, and produce features in a fixed output space. The FEFT is exactly this operator, with a complete receptive field and generalizeable over variable-dimension input spaces.

$$
f_{FEFT}(k): \bigcup_{N\geq1}\mathbb{R}^{N} \to \mathbb{C}^{k} \cong \mathbb{R}^{2k}
$$

The FEFT does this well for signals with some periodic element, and particularly sinusoidal ones due to its Fourier basis (though the same finite-embedding principle may similarly be implemented with other bases such as wavelets).

The key idea is this: instead of sampling the complete frequency set from $0$ to $N-1$, sample some $k$ fixed frequencies not necessarily within any bounds, and ascend to an optimal basis which extracts the relevant features depending on the training set and ultimate objective.

This can be nicely visualized from the Vandermonde matrix:

The full DFT operator can be written as an elementwise exponential of an outer product, with one vector cleanly representing time and the other frequency.

$$
z = \frac{-2i\pi}{N},
\qquad
\gamma=e^z.
$$

Then

$$
\begin{gathered}
\begin{bmatrix}
1 & 1 & 1 & 1 & \cdots & 1 \\
1 & \gamma & \gamma^2 & \gamma^3 & \cdots & \gamma^{N-1} \\
1 & \gamma^2 & \gamma^4 & \gamma^6 & \cdots & \gamma^{2(N-1)} \\
1 & \gamma^3 & \gamma^6 & \gamma^9 & \cdots & \gamma^{3(N-1)} \\
\vdots & \vdots & \vdots & \vdots & \ddots & \vdots \\
1 & \gamma^{N-1} & \gamma^{2(N-1)} & \gamma^{3(N-1)} & \cdots & \gamma^{(N-1)^2}
\end{bmatrix}
\\[0.6em]
=
\exp\left(
\begin{bmatrix}
0 & 0 & 0 & 0 & \cdots & 0 \\
0 & z & 2z & 3z & \cdots & (N-1)z \\
0 & 2z & 4z & 6z & \cdots & 2(N-1)z \\
0 & 3z & 6z & 9z & \cdots & 3(N-1)z \\
\vdots & \vdots & \vdots & \vdots & \ddots & \vdots \\
0 & (N-1)z & 2(N-1)z & 3(N-1)z & \cdots & (N-1)^2z
\end{bmatrix}
\right)
\\[0.4em]
=
\exp\left(\omega \otimes \tau\right),
\end{gathered}
$$

where the exponential is taken elementwise, and

$$
\omega_j = j,
\qquad 0 \leq j < N,
$$

and

$$
\tau_j = zj,
\qquad 0 \leq j < N.
$$

Thus, we can define a family of DFT-like transformations parameterized by two vectors $\omega$ and $\tau$:

$$
\mathfrak{F}_\omega
=
\frac{
\exp\left(\omega \otimes \tau\right)
}{\sqrt{N}}
.
$$

where $\omega$ cleanly controls the resultant Fourier basis. The FEFT is just a generalization, where $\omega$ may be a real-valued vector of any dimension, and optionally updated either through the following direct gradient methods, or as a part of a large parameter set in a deep learning setting.

The direct gradient rule for the FEFT can be used to find a locally optimal $\omega$ in a given vector space for a given dataset with gradient-based optimization. Naturally, we want to maximize signal. Reformulating to the single-frequency expression:

$$
\mathcal{F}_f(\omega) = \int_\mathbb{R} f(x)\exp(i\omega x) dx
$$

with the convention

$$
\langle f,g\rangle
=
\int_{\mathbb R} f(x)\overline{g(x)}\,dx.
$$

We naturally should want to increase signal, i.e. the energy captured by our particular basis set. The correct objective is thus:

$$
J_f(\omega)
=
\mathbf b^\dagger G^{-1}\mathbf b
$$

$$
b_j=\langle f,\phi_{\omega_j}\rangle,
\qquad
G_{jk}^T =\langle \phi_{\omega_j},\phi_{\omega_k}\rangle,
\qquad
\phi_{\omega}(x)=e^{-i\omega x}.
$$

Where $\dagger$ indicates the Hermitian transpose and $G^{-1}$ corrects for the nonorthogonality of the moving Fourier basis towards a joint fit, assuming $G$ is nonsingular.

Taking derivatives with respect to the frequency parameters $\omega_i$, define

$$
\mathbf c = G^{-1}\mathbf b,
\qquad
\mathbf b_i = \frac{\partial \mathbf b}{\partial \omega_i},
\qquad
G_i = \frac{\partial G}{\partial \omega_i}.
$$

Using

$$
\frac{\partial G^{-1}}{\partial \omega_i}
=
-G^{-1}G_iG^{-1},
$$

the gradient becomes

$$
\frac{\partial J}{\partial \omega_i}
=
2\,\mathrm{Re}\!\left(\mathbf b_i^\dagger \mathbf c\right)
-
\mathbf c^\dagger G_i \mathbf c.
$$

For the second derivative, define

$$
\mathbf c_j
=
\frac{\partial \mathbf c}{\partial \omega_j}
=
G^{-1}\left(\mathbf b_j-G_j\mathbf c\right),
$$

along with

$$
\mathbf b_{ij}
=
\frac{\partial^2 \mathbf b}{\partial \omega_i \partial \omega_j},
\qquad
G_{ij}
=
\frac{\partial^2 G}{\partial \omega_i \partial \omega_j}.
$$

Then the Hessian entries are

$$
H_{ij}
=
\frac{\partial^2 J}{\partial \omega_i \partial \omega_j}
=
2\,\mathrm{Re}\!\left(
\mathbf b_{ij}^\dagger \mathbf c
+
\mathbf b_i^\dagger \mathbf c_j
-
\mathbf c_j^\dagger G_i \mathbf c
\right)
-
\mathbf c^\dagger G_{ij}\mathbf c.
$$

Thus, near a nondegenerate optimum, we can achieve fast local convergence using a simple second-order update:

$$
\omega \leftarrow \omega - \eta H^{-1}\nabla_\omega J_f(\omega).
$$

For any fixed $\omega$, this is equivalent to the least-squares-optimal joint fit using a Fourier basis of this size. However, optimization over $\omega$ itself remains globally nonconvex in general, so modern methods for gradient descent (ascent) may prove useful depending on the properties of $f$.
