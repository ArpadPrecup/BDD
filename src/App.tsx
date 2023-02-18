interface VisualBddNode {
  key: string;
  depth: number;
  value?: number;
  isLeft?: boolean;
}

export default function App() {
  // The boolean function that will be turned into a binary decision diagram.
  const func = (A: number, B: number, C: number) => (!!A && !!B || !!C);

  const bdd = booleanFunctionToBDD(func);

  function createVisualizationBDDNode(
    n: BDDNode,
    d: number,
    isLeft?: boolean
  ): VisualBddNode {
    return {
      key: n.variable,
      depth: d,
      value: typeof n.variable === "number" ? n.variable : undefined,
      isLeft,
    };
  }

  // function used in order to create an array of VisualBDDNode for rendering
  function createData(
    node: BDDNode,
    data: VisualBddNode[] = [],
    d: number = 0,
    isLeft?: boolean
  ): VisualBddNode[] {
    data.push(createVisualizationBDDNode(node, d, isLeft));
    if (typeof node.low !== "number") {
      createData(node.low, data, d + 1, true);
    } else {
      data.push({
        key: "" + node.low,
        value: node.low,
        depth: d + 1,
        isLeft,
      });
    }
    if (typeof node.high !== "number") {
      createData(node.high, data, d + 1, false);
    } else {
      data.push({
        key: "" + node.high,
        value: node.high,
        depth: d + 1,
        isLeft,
      });
    }
    return data;
  }

  function isLeaf(depth: number) {
    return Math.max(...bddNodes.map((el) => el.depth)) === depth;
  }

  const bddNodes = createData(bdd);
  
  const MAX_WIDTH = 20 * Math.max(...bddNodes.map(n => n.depth));
  const HEIGHT = 5;


  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
        }}
      >
        {bddNodes.map((node, idx) => {
          const idxsWithSameDepth = bddNodes.reduce<number[]>(
            (prev, curr, i) =>
              curr.depth === node.depth ? [...prev, i] : prev,
            []
          );
          const width =
            MAX_WIDTH / bddNodes.filter((el) => el.depth === node.depth).length;
          const left =
            width * idxsWithSameDepth.findIndex((elem) => elem === idx);
          const top = HEIGHT * node.depth;

          return (
            <>
              <div
                style={{
                  position: "absolute",
                  top: `${top}rem`,
                  left: `${left}rem`,
                  width: `${width}rem`,
                  border: `1px ${
                    node.isLeft === undefined ? "none" : "solid"
                  } black`,
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  zIndex: 2,
                  backgroundColor: "white",
                  color: "black",
                }}
                key={
                  node.depth +
                  node.key +
                  node.value +
                  node.isLeft +
                  Math.random()
                }
              >
                {node.key}
              </div>
              {!isLeaf(node.depth) && (
                <div
                  style={{
                    position: "absolute",
                    left: `${left + width / 2}rem`,
                    top: `${top + 1}rem`,
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: "1px",
                      height: `${HEIGHT}rem`,
                      borderLeft: "dashed",
                      transform: `translateX(-${2}rem) rotate(30deg)`,
                      zIndex: 1,
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      width: "1px",
                      height: `${HEIGHT}rem`,
                      borderLeft: "solid",
                      transform: `translateX(${2}rem) rotate(-30deg)`,
                      zIndex: 1,
                    }}
                  ></div>
                </div>
              )}
            </>
          );
        })}
      </div>
      <div style={{position: "absolute", bottom: `0`}}>
      <div>Liniile intrerupte reprezinta faptul ca variabila de deasupra are valoarea falsa</div>
      <div>Liniile continue reprezinta faptul ca variabila de deasupra are valoarea adevarata</div>
      </div>
    </div>
  );
}

interface BDDNode {
  variable: string;
  low: BDDNode | number;
  high: BDDNode | number;
}

function booleanFunctionToBDD(func: (...vars: number[]) => boolean): BDDNode {
  function buildBDD(
    variables: string[],
    values: number[] = [],
    depth: number = 0
  ) {
    if (depth >= variables.length) {
      return func(...values) ? 1 : 0;
    }

    const low = buildBDD(variables, [...values, 0], depth + 1);
    const high = buildBDD(variables, [...values, 1], depth + 1);
    const newNode: BDDNode = { variable: variables[depth], low, high };
    return newNode;
  }

  // update here as well when adding another variable to the function
  const bdd = buildBDD(["A", "B", "C"]);

  return bdd as BDDNode;
}
