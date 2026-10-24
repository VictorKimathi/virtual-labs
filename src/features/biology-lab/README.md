# Biology 3D Lab

The Plant Cells guide links to a lazy-loaded 3D microscope bench. Learners can add, move, inspect, and remove a microscope, prepared slide, Petri dish, and dropper. With a microscope and slide present, Observe slide opens an illustrative labelled plant cell preview. This is a starter learning interaction, not an optical microscope simulation or specimen image. A 2D equipment bench remains usable if 3D graphics fail.

`/biology/anatomy` is a separate 3D human anatomy station linked from the Biology section of the Practice bench. It loads the atlas only when opened and presents a dark studio stage with a floating control panel: Front, Back, Side and Perspective camera views (also available as `?view=back` etc.), a Show inside toggle, a reset button, a live visible-structure count and a spread slider.

The assembled body is an écorché-style figure. The 170 named source muscle meshes are combined with a seamless presentation shell built from selected body-surface regions. Regions are tinted as separate muscle groups, joints and extremities are paler like tendon, and the head is ivory. Materials are patched at runtime (`components/anatomyMaterials.ts`) with a procedural muscle-fibre pattern, a rim light and a selection glow. The urogenital region and pubic hair are never displayed; a plain flush cover closes the resulting gap. A viewport offset keeps the model clear of the control panel at every zoom level.

Show inside reveals 294 internal structures, including the cerebrum and cerebellum as grouped models. The 236 source body-surface meshes are excluded from the searchable and disassembled structures. Click the assembled anatomy or use the spread slider to arrange all 464 named structures in ordered rows by system, filter by body system, search, and select a mesh from the scene or list. If 3D rendering fails, the searchable structure list remains available.

The atlas model is adapted from Z-Anatomy by Vanatome under CC BY-SA 4.0. See `public/models/ANATOMY-LICENSE.md` for attribution, source links, and modification details.
