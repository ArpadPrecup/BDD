interface Repr {
  key: string;
  depth: number;
  value?: number;
  isLeft?: boolean;
}

export default function App() {
  // The boolean function that will be turned into a binary decision diagram.
  const func = (A: number, B: number, C: number) => !!A && !B && !!C;

  const bdd = booleanFunctionToBDD(func);

  function createRepr(n: BDDNode, d: number, isLeft?: boolean): Repr {
    return {
      key: n.variable,
      depth: d,
      value: typeof n.variable === "number" ? n.variable : undefined,
      isLeft,
    };
  }

  function createData(
    node: BDDNode,
    data: Repr[] = [],
    d: number = 0,
    isLeft?: boolean
  ): Repr[] {
    data.push(createRepr(node, d, isLeft));
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

  function isLeaves(depth: number) {
    return Math.max(...d.map((el) => el.depth)) === depth;
  }

  const MAX_WIDTH = 30;
  const HEIGHT = 5;

  const d = createData(bdd);

  return d.map((e, idx) => {
    const idxsWithSameDepth = d.reduce<number[]>(
      (prev, curr, i) => (curr.depth === e.depth ? [...prev, i] : prev),
      []
    );
    const width = MAX_WIDTH / d.filter((el) => el.depth === e.depth).length;
    const left = width * idxsWithSameDepth.findIndex((elem) => elem === idx);
    const top = HEIGHT * e.depth;

    return (
      <>
        <div
          style={{
            position: "absolute",
            top: `${top}rem`,
            left: `${left}rem`,
            width: `${width}rem`,
            border: `1px ${e.isLeft === undefined ? "none" : "solid"} black`,
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
            zIndex: 2,
            backgroundColor: "white",
          }}
          key={e.depth + e.key + e.value + e.isLeft + Math.random()}
        >
          {e.key}
        </div>
        {!isLeaves(e.depth) && (
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
  });
}

interface BDDNode {
  variable: string;
  low: BDDNode | number;
  high: BDDNode | number;
}

function booleanFunctionToBDD(func: (...vars: number[]) => boolean): {
  bdd: BDDNode;
} {
  const variableToNodeMap: Map<string, BDDNode> = new Map();
  let nodes: BDDNode[] = [];

  function getNode(
    variable: string,
    low: BDDNode | number,
    high: BDDNode | number
  ){
    let node = variableToNodeMap.get(
      `${variable}_${low}_${high}_${Math.random()}`
    );
    if (!node) {
      node = { variable, low, high };
      nodes.push(node);
      variableToNodeMap.set(`${variable}_${low}_${high}`, node);
    }
    return node;
  };

  function buildBDD(variables: string[], values: number[], depth: number){
    if (depth >= variables.length) {
      return func(...values) ? 1 : 0;
    }

    const low = buildBDD(variables, [...values, 0], depth + 1);
    const high = buildBDD(variables, [...values, 1], depth + 1);
    return getNode(variables[depth], low, high);
  };

  // UPDATE HERE
  const bdd = buildBDD(["A", "B", "C"], [], 0);

  return bdd;
}
