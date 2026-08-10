For **Logged**, I'd avoid the typical "green app" look. Instead, use **emerald as the accent**, while letting glass, light, and neutral tones dominate the interface. The emerald should guide attention, not overwhelm it.

# Logged Design Tokens

## Primary

```css
--primary: #10B981;
--primary-hover: #059669;
--primary-active: #047857;
--primary-light: #D1FAE5;
--primary-soft: rgba(16,185,129,.12);
```

Use for:

* Primary buttons
* Active navigation
* Selected states
* Progress indicators
* Success actions

---

## Background

```css
--background: #F5F7FA;
--background-secondary: #EEF2F6;
--background-tertiary: #E7ECF2;
```

This gives the UI a soft gray base that makes the glass effect stand out.

---

## Glass Surfaces

```css
--glass: rgba(255,255,255,.55);
--glass-hover: rgba(255,255,255,.68);
--glass-active: rgba(255,255,255,.78);
```

Apply:

```css
backdrop-filter: blur(24px);
-webkit-backdrop-filter: blur(24px);
```

---

## Borders

```css
--border: rgba(255,255,255,.40);
--border-secondary: rgba(15,23,42,.08);
```

Avoid dark borders. Let the blur define the components.

---

## Text

```css
--text: #0F172A;
--text-secondary: #475569;
--text-muted: #64748B;
--text-disabled: #94A3B8;
```

---

## Status Colors

### Success

```css
#10B981
```

### Warning

```css
#F59E0B
```

### Error

```css
#EF4444
```

### Info

```css
#3B82F6
```

### Debug

```css
#8B5CF6
```

---

## Shadows

```css
--shadow-sm: 0 4px 12px rgba(15,23,42,.05);

--shadow-md: 0 8px 24px rgba(15,23,42,.08);

--shadow-lg: 0 16px 40px rgba(15,23,42,.12);
```

Keep shadows soft and diffused.

---

## Radius

```css
--radius-sm: 12px;
--radius-md: 18px;
--radius-lg: 24px;
--radius-xl: 30px;
```

---

## Sidebar

```css
background:
rgba(255,255,255,.42);
```

Active item:

```css
background:
rgba(16,185,129,.15);

color:
#10B981;
```

---

## Buttons

### Primary

```css
background: #10B981;
color: white;
```

Hover

```css
background: #059669;
```

---

### Secondary

```css
background: rgba(255,255,255,.45);

border:
1px solid rgba(255,255,255,.40);
```

---

### Ghost

Transparent with a subtle glass hover:

```css
background: transparent;

:hover {
    background: rgba(255,255,255,.45);
}
```

---

## Inputs

```css
background:
rgba(255,255,255,.55);

border:
1px solid rgba(255,255,255,.45);
```

Focus

```css
border-color: #10B981;

box-shadow:
0 0 0 4px rgba(16,185,129,.15);
```

---

## Charts

Use a restrained palette:

| Purpose | Color     |
| ------- | --------- |
| Primary | `#10B981` |
| Info    | `#3B82F6` |
| Warning | `#F59E0B` |
| Error   | `#EF4444` |
| Debug   | `#8B5CF6` |
| Neutral | `#CBD5E1` |

---

## Gradients

Background:

```css
linear-gradient(
135deg,
#F8FAFC 0%,
#EEF2F6 100%
)
```

Accent:

```css
linear-gradient(
135deg,
#10B981,
#34D399
)
```

---

## Overall Feel

* **Primary accent:** Emerald (`#10B981`) for actions and highlights.
* **Base:** Cool light grays and frosted glass, inspired by Apple's Liquid Glass aesthetic.
* **Interaction:** Minimal color changes; rely on blur, transparency, elevation, and subtle animations to communicate state.
* **Result:** A clean, premium dashboard that feels modern and calming, while the emerald accent reinforces the ideas of reliability, health, and successful system operation.
